import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManagerTimesheetSummary = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const resp = await axios.get('/api/manager/timesheets/summary');
        setSummary(resp.data.data || resp.data || []);
      } catch (e) {
        console.error('Failed to fetch manager summary', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  // Group by project for display
  const projects = {};
  (summary || []).forEach(row => {
    if (!projects[row.projectId]) projects[row.projectId] = { projectName: row.projectName, rows: [] };
    projects[row.projectId].rows.push(row);
  });

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Timesheet Summary (Project → Employee → Hours)</h2>
      {Object.keys(projects).length === 0 ? (
        <div>No data</div>
      ) : (
        Object.keys(projects).map(pid => (
          <div key={pid} className="mb-6">
            <h3 className="font-medium">{projects[pid].projectName}</h3>
            <table className="min-w-full divide-y divide-gray-200 mt-2">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {projects[pid].rows.map(r => (
                  <tr key={r.employeeId} className="bg-white">
                    <td className="px-4 py-2 text-sm text-gray-900">{r.employeeName}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{Number(r.totalHours).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default ManagerTimesheetSummary;
