import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const TimesheetManagement = () => {
  const auth = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, timesheetId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    fetchTimesheets();
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProjects = async () => {
    try {
      const endpoint = (auth && auth.isHR && auth.isHR()) ? '/api/hr/projects' : '/api/projects';
      const resp = await axios.get(endpoint);
      setProjects(resp.data?.data || resp.data || []);
    } catch (err) {
      // if projects endpoint not available, derive from timesheets when they arrive
      console.warn('Failed to fetch projects, will derive from timesheets', err?.message || err);
      setProjects([]);
    }
  };

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      let resp;
      if (auth && auth.isManager && auth.isManager()) {
        // Manager endpoints
        if (statusFilter) {
          resp = await axios.get(`/api/manager/timesheets/status/${statusFilter}`);
        } else {
          resp = await axios.get('/api/manager/timesheets');
        }
      } else if (auth && auth.isHR && auth.isHR()) {
        // HR wants to view all timesheets via HR-scoped endpoint
        resp = await axios.get('/api/hr/timesheets');
      } else {
        // Regular employee
        resp = await axios.get('/api/timesheets');
      }
      setTimesheets(resp.data?.data || resp.data || []);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      toast.error('Failed to fetch timesheets');
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  const changeTimesheetStatus = async (timesheetId, status, comment) => {
    setModalLoading(true);
    setActionLoading(prev => ({ ...prev, [timesheetId]: true }));
    try {
      const body = { status };
      if (comment) body.comment = comment;
      const resp = await axios.put(`/api/manager/timesheets/${timesheetId}/status`, body);

      // optimistic update: update only that row
      setTimesheets(prev => prev.map(t => t.id === timesheetId ? { ...t, status, rejectionReason: status === 'REJECTED' ? (comment || t.rejectionReason) : undefined } : t));
      // keep modal in sync if it's open for the same timesheet
      setSelectedTimesheet(prev => prev && prev.id === timesheetId ? { ...prev, status, rejectionReason: status === 'REJECTED' ? (comment || prev.rejectionReason) : undefined } : prev);
      toast.success('Timesheet updated');
      setConfirmModal({ show: false, action: null, timesheetId: null });
      setRejectReason('');
    } catch (error) {
      console.error(`Error setting timesheet status to ${status}:`, error);
      toast.error('Failed to change timesheet status');
    } finally {
      setModalLoading(false);
      setActionLoading(prev => ({ ...prev, [timesheetId]: false }));
    }
  };

  const handleApproveConfirm = (timesheetId) => {
    setConfirmModal({ show: true, action: 'APPROVED', timesheetId });
  };

  const handleRejectConfirm = (timesheetId) => {
    setConfirmModal({ show: true, action: 'REJECTED', timesheetId });
  };

  const handleConfirmSubmit = async () => {
    if (!confirmModal.timesheetId || !confirmModal.action) return;
    if (confirmModal.action === 'REJECTED') {
      if (!rejectReason || !rejectReason.trim()) {
        toast.error('Please provide a rejection reason');
        return;
      }
      await changeTimesheetStatus(confirmModal.timesheetId, 'REJECTED', rejectReason.trim());
    } else {
      await changeTimesheetStatus(confirmModal.timesheetId, 'APPROVED', null);
    }
  };

  const handleViewTimesheet = (ts) => {
    setSelectedTimesheet(ts);
    setShowModal(true);
  };

  const clearFilters = () => {
    setProjectFilter('');
    setStartDateFilter('');
    setStatusFilter('');
    setEndDateFilter('');
  };

  const matchesFilters = (t) => {
    const projId = t.project?.id ?? t.projectId ?? 'ungrouped';
    if (projectFilter) {
      if (!projId || String(projId) !== String(projectFilter)) return false;
    }
    if (startDateFilter) {
      if (new Date(t.date) < new Date(startDateFilter + 'T00:00:00')) return false;
    }
    if (endDateFilter) {
      if (new Date(t.date) > new Date(endDateFilter + 'T23:59:59')) return false;
    }
    return true;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString();
  };

  // Helpers to compute week range (Mon-Sun) containing a date and aggregate statuses
  const getWeekRange = (dateString) => {
    const d = new Date(dateString);
    // start on Monday
    const day = (d.getDay() + 6) % 7; // 0 = Monday
    const monday = new Date(d);
    monday.setDate(d.getDate() - day);
    monday.setHours(0,0,0,0);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + i);
      dates.push(dt);
    }
    return dates;
  };

  // Helper to compute badge class for status
  const badgeClassForStatus = (status) => {
    if (status === 'APPROVED') return 'bg-green-100 text-green-800';
    if (status === 'REJECTED') return 'bg-red-100 text-red-800';
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Helper to compute weekly summary
  const computeWeeklySummary = (ts) => {
    if (!ts) return null;

    // If this is a grouped timesheet with days array
    const days = Array.isArray(ts.days) && ts.days.length > 0 ? ts.days : (ts.date ? [
      {
        id: ts.id,
        date: ts.date,
        hours: ts.hours ?? ts.hoursWorked,
        status: ts.status || 'PENDING',
        notes: ts.notes || ts.description || ''
      }
    ] : []);

    // Determine week range using the first available date
    const firstDate = days.length ? days[0].date : ts.date;
    const weekDates = firstDate ? getWeekRange(firstDate).map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate())) : [];

    const dayMap = {};
    days.forEach(d => {
      const key = new Date(d.date).toDateString();
      dayMap[key] = { ...d };
    });

    // Compute overall status: REJECTED if any rejected, APPROVED if all approved (and at least one), else PENDING
    const statuses = days.map(d => d.status || 'PENDING');
    const overall = statuses.length === 0 ? 'PENDING' : (statuses.some(s => s === 'REJECTED') ? 'REJECTED' : (statuses.every(s => s === 'APPROVED') ? 'APPROVED' : 'PENDING'));

    return { weekDates, dayMap, overall };
  };

  // Small helper that returns a JSX badge for a status string
  const getStatusBadge = (status) => {
    const cls = badgeClassForStatus(status || 'PENDING');
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
        {status || 'PENDING'}
      </span>
    );
  };

  const renderTimesheetRow = (timesheet) => {
    const { overallStatus } = computeWeeklySummary(timesheet);

    return (
      <tr key={timesheet.id} className="border-t">
        <td className="py-2">{timesheet.employeeName}</td>
        <td className="py-2">{timesheet.projectName}</td>
        <td className="py-2">
          <div className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${badgeClassForStatus(overallStatus)}`}>
            {overallStatus}
          </div>
        </td>
        {/* ...existing columns... */}
      </tr>
    );
  };

  const renderTimesheetModal = (timesheet) => {
    const { overallStatus, dayStatuses } = computeWeeklySummary(timesheet);

    return (
      <div>
        <h3>Weekly Status: {overallStatus}</h3>
        <div className="flex space-x-2">
          {dayStatuses.map((status, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${badgeClassForStatus(status)}`}
            >
              {status}
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Timesheets</h1>
        <p className="text-gray-600">View and manage your submitted timesheets</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Timesheet History</h3>
            <div className="flex items-center space-x-2">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={async (e) => {
                  const val = e.target.value;
                  setStatusFilter(val);
                  if (val) {
                    await fetchTimesheets();
                  } else {
                    await fetchTimesheets();
                  }
                }}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <input type="date" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} className="px-2 py-1 border rounded text-sm" />
              <input type="date" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} className="px-2 py-1 border rounded text-sm" />
              <button onClick={clearFilters} className="px-2 py-1 bg-gray-100 rounded text-sm">Clear</button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {(() => {
            const filtered = timesheets.filter(matchesFilters);
            if (filtered.length === 0) {
              return (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No timesheets</h3>
                  <p className="mt-1 text-sm text-gray-500">You have no timesheets matching the filters.</p>
                </div>
              );
            }

            const projectsMap = {};
            filtered.forEach(ts => {
              const projId = ts.project?.id ?? ts.projectId ?? 'ungrouped';
              const projName = ts.project?.name ?? ts.projectName ?? 'Ungrouped Projects';
              if (!projectsMap[projId]) projectsMap[projId] = { id: projId, name: projName, employees: {} };

              const empId = ts.user?.id ?? ts.userId ?? 'unknown';
              const empName = ts.user?.name ?? ts.userName ?? 'Unknown Employee';
              if (!projectsMap[projId].employees[empId]) projectsMap[projId].employees[empId] = { id: empId, name: empName, timesheets: [] };

              projectsMap[projId].employees[empId].timesheets.push(ts);
            });

            if (!selectedProjectId) {
              return (
                <div className="space-y-3 p-4">
                  {Object.values(projectsMap).map(project => {
                    const projectTotalHours = Object.values(project.employees).flatMap(e => e.timesheets).reduce((s, t) => s + (Number(t.hours) || 0), 0);
                    return (
                      <div key={project.id} className="p-4 border rounded hover:shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold">{project.name}</h4>
                            <div className="text-sm text-gray-500">{Object.keys(project.employees).length} employee(s) • {projectTotalHours} hrs</div>
                          </div>
                          <div>
                            <button onClick={() => { setSelectedProjectId(project.id); setSelectedEmployeeId(null); }} className="px-3 py-1 bg-indigo-600 text-white rounded">View employees</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            const project = Object.values(projectsMap).find(p => String(p.id) === String(selectedProjectId));
            if (!project) {
              return (
                <div className="p-4">
                  <button onClick={() => setSelectedProjectId(null)} className="text-sm text-indigo-600">← Back to projects</button>
                  <div className="mt-3 text-sm text-gray-500">No employees found for selected project.</div>
                </div>
              );
            }

            if (selectedProjectId && !selectedEmployeeId) {
              return (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <button onClick={() => { setSelectedProjectId(null); setSelectedEmployeeId(null); }} className="text-sm text-indigo-600">← Back to projects</button>
                      <h3 className="text-xl font-semibold mt-2">Employees in {project.name}</h3>
                    </div>
                    <div className="text-sm text-gray-500">{Object.keys(project.employees).length} employee(s)</div>
                  </div>
                  <div className="space-y-2">
                    {Object.values(project.employees).map(emp => (
                      <div key={emp.id} className="p-3 border rounded flex items-center justify-between">
                        <div>
                          <div className="font-medium">{emp.name}</div>
                          <div className="text-xs text-gray-500">{emp.timesheets.length} entries • {emp.timesheets.reduce((s,t)=>s+(Number(t.hours)||0),0)} hrs</div>
                        </div>
                        <div>
                          <button onClick={() => setSelectedEmployeeId(emp.id)} className="px-3 py-1 bg-indigo-600 text-white rounded">View timesheets</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            const emp = Object.values(project.employees).find(e => String(e.id) === String(selectedEmployeeId));
            if (!emp) {
              return (
                <div className="p-4">
                  <button onClick={() => setSelectedEmployeeId(null)} className="text-sm text-indigo-600">← Back to employees</button>
                  <div className="mt-3 text-sm text-gray-500">Selected employee has no timesheets.</div>
                </div>
              );
            }

            return (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <button onClick={() => setSelectedEmployeeId(null)} className="text-sm text-indigo-600">← Back to employees</button>
                    <h3 className="text-xl font-semibold mt-2">Timesheets for {emp.name} — {project.name}</h3>
                  </div>
                  <div className="text-sm text-gray-500">{emp.timesheets.length} entries</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(() => {
                        // Group timesheets by the week (Monday start)
                        const weeksMap = {};
                        emp.timesheets.forEach(ts => {
                          const wkStart = getWeekRange(ts.date)[0];
                          const key = wkStart.toDateString();
                          if (!weeksMap[key]) {
                            weeksMap[key] = { weekStart: new Date(wkStart), weekEnd: new Date(wkStart) };
                            weeksMap[key].weekEnd.setDate(weeksMap[key].weekStart.getDate() + 6);
                            weeksMap[key].days = [];
                          }
                          weeksMap[key].days.push(ts);
                        });

                        const weekEntries = Object.values(weeksMap).sort((a,b) => a.weekStart - b.weekStart);

                        return weekEntries.map((w, wi) => {
                          const totalHours = w.days.reduce((s,d) => s + (Number(d.hours) || Number(d.hoursWorked) || 0), 0);
                          // compute overall for the week
                          const statuses = w.days.map(d => d.status || 'PENDING');
                          const overall = statuses.length === 0 ? 'PENDING' : (statuses.some(s => s === 'REJECTED') ? 'REJECTED' : (statuses.every(s => s === 'APPROVED') ? 'APPROVED' : 'PENDING'));
                          return (
                            <tr key={`week-${wi}-${w.weekStart.toDateString()}`} className="align-top hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="font-medium">{w.weekStart.toLocaleDateString()} - {w.weekEnd.toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500">{w.days.length} day(s)</div>
                                <div className="mt-2 space-y-1">
                                  {w.days.sort((a,b)=>new Date(a.date)-new Date(b.date)).map(d => (
                                    <div key={`day-${d.id}`} className="flex items-center justify-between text-xs">
                                      <div className="text-gray-700">{formatDate(d.date)}</div>
                                      <div className="flex items-center space-x-2">
                                        <div className="text-gray-600">{d.hours ?? d.hoursWorked ?? ''} hrs</div>
                                        <div>{getStatusBadge(d.status)}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totalHours}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(overall)}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badgeClassForStatus(overall)}`}>{overall}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {/* Read-only weekly view: no approve/reject/delete actions here */}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Timesheet Detail Modal */}
      {showModal && selectedTimesheet && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Timesheet Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
                <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Project:</label>
                  <p className="text-sm text-gray-900">{selectedTimesheet.project?.name || selectedTimesheet.projectName || 'Unknown Project'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Date:</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedTimesheet.date)}</p>
                </div>

                {auth && auth.isManager && auth.isManager() && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Employee:</label>
                    <p className="text-sm text-gray-900">{selectedTimesheet.user?.name || selectedTimesheet.userName || 'Unknown'}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Hours Worked:</label>
                  <p className="text-sm text-gray-900">{selectedTimesheet.hours ?? selectedTimesheet.hoursWorked ?? ''}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Description:</label>
                  <p className="text-sm text-gray-900">{selectedTimesheet.description || 'No description provided'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Status:</label>
                  <div className="mt-1">{getStatusBadge(selectedTimesheet.status)}</div>
                </div>

                {selectedTimesheet.status === 'REJECTED' && selectedTimesheet.rejectionReason && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rejection Reason:</label>
                    <p className="text-sm text-red-600">{selectedTimesheet.rejectionReason}</p>
                  </div>
                )}

                {/* Weekly summary block */}
                {selectedTimesheet && (
                  (() => {
                    const summary = computeWeeklySummary(selectedTimesheet);
                    if (!summary) return null;
                    const { weekDates, dayMap, overall } = summary;
                    return (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Week Summary:</label>
                        <div className="mt-2 flex items-center space-x-2">
                          <div className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${badgeClassForStatus(overall)}`}>Weekly: {overall}</div>
                          <div className="flex space-x-1">
                            {weekDates.map(d => {
                              const entry = dayMap[d.toDateString()];
                              const st = entry?.status === 'NONE' ? '—' : (entry?.status || 'PENDING');
                              return (
                                <div key={d.toDateString()} className="text-center text-xs">
                                  <div className={`px-2 py-1 rounded ${badgeClassForStatus(st)}`}>{st === '—' ? '—' : st}</div>
                                  <div className="text-xxs text-gray-500">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
              
              <div className="mt-6">
                <div className="flex space-x-2">
                  {auth && auth.isManager && auth.isManager() && selectedTimesheet && selectedTimesheet.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleApproveConfirm(selectedTimesheet.id)} disabled={!!actionLoading[selectedTimesheet.id]} className="btn-primary">{actionLoading[selectedTimesheet.id] ? 'Approving...' : 'Approve'}</button>
                      <button onClick={() => handleRejectConfirm(selectedTimesheet.id)} disabled={!!actionLoading[selectedTimesheet.id]} className="btn-danger">{actionLoading[selectedTimesheet.id] ? 'Rejecting...' : 'Reject'}</button>
                    </>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm / Reject Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{confirmModal.action === 'APPROVED' ? 'Confirm Approve' : 'Confirm Reject'}</h3>
                <button onClick={() => setConfirmModal({ show: false, action: null, timesheetId: null })} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-700">Are you sure you want to {confirmModal.action === 'APPROVED' ? 'approve' : 'reject'} this timesheet?</p>
                {confirmModal.action === 'REJECTED' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rejection Reason (required)</label>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full mt-1 p-2 border rounded" rows={4} />
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-2">
                <button onClick={handleConfirmSubmit} className="btn-primary">Confirm</button>
                <button onClick={() => setConfirmModal({ show: false, action: null, timesheetId: null })} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetManagement;