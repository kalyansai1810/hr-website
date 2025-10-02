import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user, isAdmin, isHR, isManager, isEmployee } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTimesheets: 0,
    pendingTimesheets: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        if (isAdmin()) {
          const [usersRes, projectsRes, timesheetsRes] = await Promise.all([
            axios.get('/api/admin/users'),
            axios.get('/api/admin/projects'),
            axios.get('/api/admin/timesheets')
          ]);

          setStats({
            totalUsers: usersRes.data.data?.length || 0,
            totalProjects: projectsRes.data.data?.length || 0,
            totalTimesheets: timesheetsRes.data.data?.length || 0,
            pendingTimesheets: timesheetsRes.data.data?.filter(t => t.status === 'PENDING').length || 0
          });
        } else if (isHR()) {
          const [projectsRes, timesheetsRes] = await Promise.all([
            axios.get('/api/hr/projects'),
            axios.get('/api/hr/timesheets')
          ]);

          setStats({
            totalProjects: projectsRes.data.data?.length || 0,
            totalTimesheets: timesheetsRes.data.data?.length || 0,
            pendingTimesheets: timesheetsRes.data.data?.filter(t => t.status === 'PENDING').length || 0
          });
        } else if (isManager()) {
          const timesheetsRes = await axios.get('/api/manager/timesheets');
          
          setStats({
            totalTimesheets: timesheetsRes.data.data?.length || 0,
            pendingTimesheets: timesheetsRes.data.data?.filter(t => t.status === 'PENDING').length || 0
          });
        } else if (isEmployee()) {
          const timesheetsRes = await axios.get('/api/timesheets');
          
          setStats({
            totalTimesheets: timesheetsRes.data.data?.length || 0,
            pendingTimesheets: timesheetsRes.data.data?.filter(t => t.status === 'PENDING').length || 0
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin, isHR, isManager, isEmployee]);

  const getWelcomeMessage = () => {
    const timeOfDay = new Date().getHours() < 12 ? 'Good morning' : 
                     new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
    return `${timeOfDay}, ${user?.name}!`;
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'You have full system access and can manage all users, projects, and timesheets.';
      case 'HR':
        return 'You can manage projects, assign employees, and view all timesheets.';
      case 'MANAGER':
        return 'You can approve/reject timesheets from your team members.';
      case 'EMPLOYEE':
        return 'You can submit timesheets for your assigned projects.';
      default:
        return 'Welcome to the HR System.';
    }
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getWelcomeMessage()}
        </h1>
        <p className="text-gray-600">{getRoleDescription()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isAdmin() && (
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {(isAdmin() || isHR()) && (
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="bg-purple-500 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isEmployee() ? 'My Timesheets' : 'Total Timesheets'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTimesheets}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="bg-yellow-500 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Timesheets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTimesheets}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {isEmployee() && (
                <button className="w-full btn-primary">
                  Submit New Timesheet
                </button>
              )}
              {isManager() && (
                <button className="w-full btn-primary">
                  Review Pending Timesheets
                </button>
              )}
              {isHR() && (
                <>
                  <button className="w-full btn-primary">
                    Create New Project
                  </button>
                  <button className="w-full btn-secondary">
                    Assign Employee to Project
                  </button>
                </>
              )}
              {isAdmin() && (
                <>
                  <button className="w-full btn-primary">
                    Create New User
                  </button>
                  <button className="w-full btn-secondary">
                    View System Reports
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Recent Activity</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Welcome to the HR System</p>
                  <p className="text-sm text-gray-500">System is ready for use</p>
                </div>
                <span className="text-xs text-gray-400">Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;