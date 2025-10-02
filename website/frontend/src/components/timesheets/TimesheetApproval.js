import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TimesheetApproval = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projectFilter, setProjectFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  useEffect(() => {
    fetchPendingTimesheetsGrouped();
    fetchManagedProjects();
    fetchManagedEmployees();
  }, []);

  const fetchPendingTimesheets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/manager/timesheets/pending');
      const all = response.data?.data || response.data || [];
      console.log('DEBUG: fetched pending timesheets', all);
      const pendingTimesheets = (Array.isArray(all) ? all : []).filter(t => t.status === 'PENDING');
      setTimesheets(pendingTimesheets);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Backend not running. Please start the backend server on port 8081.');
      } else {
        toast.error('Failed to fetch pending timesheets');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTimesheetsGrouped = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/manager/timesheets/pending/grouped');
      const all = response.data?.data || response.data || [];
      console.log('DEBUG: fetched grouped pending timesheets', all);
      setTimesheets(all || []);
    } catch (error) {
      console.error('Error fetching grouped timesheets:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Backend not running. Please start the backend server on port 8081.');
      } else {
        toast.error('Failed to fetch grouped pending timesheets');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchManagedProjects = async () => {
    try {
      const resp = await axios.get('/api/manager/projects');
      const p = resp.data?.data || resp.data || [];
      setProjects(Array.isArray(p) ? p : []);
    } catch (err) {
      console.warn('Failed to fetch manager projects', err?.response?.data || err.message);
    }
  };

  const fetchManagedEmployees = async () => {
    try {
      const resp = await axios.get('/api/manager/employees');
      const e = resp.data?.data || resp.data || [];
      setEmployees(Array.isArray(e) ? e : []);
    } catch (err) {
      console.warn('Failed to fetch manager employees', err?.response?.data || err.message);
    }
  };

  const clearFilters = () => {
    setProjectFilter('');
    setEmployeeFilter('');
    setStatusFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  // Derived lists used for dropdowns: prefer manager-provided lists, otherwise build from pending timesheets
  const displayProjects = (projects && projects.length > 0)
    ? projects
    : Array.from(
        new Map(
          timesheets
            .map(t => t.project || (t.projectId ? { id: t.projectId, name: t.projectName } : null))
            .filter(Boolean)
            .map(p => [String(p.id), p])
        ).values()
      );

  const displayEmployees = (employees && employees.length > 0)
    ? employees
    : Array.from(
        new Map(
          timesheets
            .map(t => t.user || (t.employeeId ? { id: t.employeeId, name: t.employeeName } : null))
            .filter(Boolean)
            .map(u => [String(u.id), u])
        ).values()
      );

  if ((!projects || projects.length === 0) && displayProjects.length > 0) {
    console.debug('Using fallback projects derived from pending timesheets', displayProjects);
  }
  if ((!employees || employees.length === 0) && displayEmployees.length > 0) {
    console.debug('Using fallback employees derived from pending timesheets', displayEmployees);
  }

  const matchesFilters = (t) => {
    // Support grouped items (week groups) and legacy flat timesheet objects
    // If object has 'days', treat it as a group
    if (t && Array.isArray(t.days)) {
      if (projectFilter) {
        if (!t.projectId || String(t.projectId) !== String(projectFilter)) return false;
      }
      if (employeeFilter) {
        if (!t.employeeId || String(t.employeeId) !== String(employeeFilter)) return false;
      }
      // date range: include group if any day falls within the requested range
      if (startDateFilter || endDateFilter) {
        const start = startDateFilter ? new Date(startDateFilter + 'T00:00:00') : null;
        const end = endDateFilter ? new Date(endDateFilter + 'T23:59:59') : null;
        const anyMatch = t.days.some(d => {
          const dt = new Date(d.date + 'T00:00:00');
          if (start && dt < start) return false;
          if (end && dt > end) return false;
          return true;
        });
        if (!anyMatch) return false;
      }
      if (statusFilter) {
        const anyStatus = (t.days || []).some(d => ((d.status || 'PENDING') === statusFilter));
        if (!anyStatus) return false;
      }
      return true;
    }

    // legacy single-timesheet object
    const projId = t.project?.id ?? t.projectId;
    if (projectFilter) {
      if (!projId || String(projId) !== String(projectFilter)) return false;
    }
    const empId = t.user?.id ?? t.employeeId;
    if (employeeFilter) {
      if (!empId || String(empId) !== String(employeeFilter)) return false;
    }
    if (startDateFilter) {
      if (new Date(t.date) < new Date(startDateFilter + 'T00:00:00')) return false;
    }
    if (endDateFilter) {
      if (new Date(t.date) > new Date(endDateFilter + 'T23:59:59')) return false;
    }
    if (statusFilter) {
      const s = t.status || t.status;
      if (!s || String(s) !== String(statusFilter)) return false;
    }
    return true;
  };

  // Helper to set status for a single day/timesheet
  const setDayStatus = async (id, status, comments) => {
    try {
      setProcessingId(id);
      const body = { status };
      if (comments) body.comments = comments;
      await axios.put(`/api/manager/timesheets/${id}/status`, body);
      // update local UI state to reflect new status
      setTimesheets(prev => prev.map(g => ({
        ...g,
        days: (g.days || []).map(d => d.id === id ? { ...d, status } : d)
      })));
      toast.success('Status updated');
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (timesheetId) => {
    // set status to APPROVED using unified endpoint
    await setDayStatus(timesheetId, 'APPROVED');
  };

  const handleRejectClick = (group, day) => {
    // store both the group and day so modal has context
    setSelectedTimesheet({ group, day });
    setRejectionReason('');
    setShowModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const id = selectedTimesheet.day.id;
      await setDayStatus(id, 'REJECTED', rejectionReason);
      setShowModal(false);
      setSelectedTimesheet(null);
      setRejectionReason('');
      
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject timesheet';
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const badgeClassForStatus = (s) => {
    if (s === 'APPROVED') return 'bg-green-100 text-green-800';
    if (s === 'REJECTED') return 'bg-red-100 text-red-800';
    if (s === 'PENDING') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const computeGroupOverall = (group) => {
    const statuses = (group.days || []).map(d => d.status || 'PENDING');
    if (statuses.length === 0) return 'PENDING';
    if (statuses.some(s => s === 'REJECTED')) return 'REJECTED';
    if (statuses.every(s => s === 'APPROVED')) return 'APPROVED';
    return 'PENDING';
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Timesheet Approval</h1>
        <p className="text-gray-600">Review and approve pending timesheets from your team</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Pending Timesheets ({timesheets.length})</h3>
            <div className="flex items-center space-x-2">
              <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="px-2 py-1 border rounded text-sm">
                <option value="">All Projects</option>
                {displayProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="px-2 py-1 border rounded text-sm">
                <option value="">All Employees</option>
                {displayEmployees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-2 py-1 border rounded text-sm">
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
          {timesheets.filter(matchesFilters).length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending timesheets</h3>
              <p className="mt-1 text-sm text-gray-500">All timesheets have been reviewed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4">
              {timesheets.filter(matchesFilters).map((group, idx) => (
                <div key={`group-${idx}-${group.employeeId}-${group.projectId}-${group.weekStart}`} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{group.employeeName || 'Unknown Employee'}</div>
                      <div className="text-xs text-gray-500">{group.projectName || 'Unknown Project'}</div>
                      <div className="text-xs text-gray-500">Week: {new Date(group.weekStart).toLocaleDateString()} - {new Date(group.weekEnd).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-700">{(group.days || []).reduce((s, d) => s + (d.hours || 0), 0)} hrs</div>
                      <div className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${badgeClassForStatus(computeGroupOverall(group))}`}>{computeGroupOverall(group)}</div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500">
                          <th className="py-1">Date</th>
                          <th className="py-1">Hours</th>
                          <th className="py-1">Description</th>
                          <th className="py-1">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(group.days || []).map(day => (
                          <tr key={day.id} className="border-t">
                            <td className="py-2">{new Date(day.date).toLocaleDateString()}</td>
                            <td className="py-2">{day.hours ?? ''}</td>
                            <td className="py-2">{day.notes || day.description || 'No description'}</td>
                            <td className="py-2">
                              <div className="flex space-x-2">
                                <button onClick={() => handleApprove(day.id)} disabled={processingId === day.id} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed">{processingId === day.id ? 'Approving...' : 'Approve'}</button>
                                <button onClick={() => handleRejectClick(group, day)} disabled={processingId === day.id} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed">Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showModal && selectedTimesheet && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reject Timesheet</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Employee: <span className="font-medium">{selectedTimesheet.group?.employeeName || selectedTimesheet.employeeName || 'Unknown'}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Project: <span className="font-medium">{selectedTimesheet.group?.projectName || selectedTimesheet.projectName || 'Unknown Project'}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Date: <span className="font-medium">{formatDate(selectedTimesheet.day?.date)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Hours: <span className="font-medium">{selectedTimesheet.day?.hours ?? ''}</span>
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Please provide a clear reason for rejecting this timesheet..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={processingId === selectedTimesheet.day?.id || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingId === selectedTimesheet.day?.id ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner-sm mr-2"></div>
                      Rejecting...
                    </div>
                  ) : (
                    'Reject Timesheet'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimesheetApproval;