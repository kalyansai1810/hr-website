import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon, 
  UsersIcon, 
  ClockIcon, 
  FolderIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, logout, isAdmin, isHR, isManager, isEmployee } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavigationItems = () => {
    const items = [
      { id: 'dashboard', name: 'Dashboard', icon: HomeIcon, path: '/dashboard', roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] }
    ];

    if (isAdmin()) {
      items.push(
        { id: 'users', name: 'User Management', icon: UsersIcon, path: '/users', roles: ['ADMIN'] },
        { id: 'projects', name: 'All Projects', icon: FolderIcon, path: '/projects', roles: ['ADMIN'] },
        { id: 'timesheets-manage', name: 'All Timesheets', icon: ClockIcon, path: '/timesheets/manage', roles: ['ADMIN'] }
      );
    }

    if (isHR()) {
      items.push(
        { id: 'projects', name: 'Project Management', icon: FolderIcon, path: '/projects', roles: ['HR'] },
        { id: 'timesheets-manage', name: 'All Timesheets', icon: ClockIcon, path: '/timesheets/manage', roles: ['HR'] }
      );
    }

    if (isManager()) {
      items.push(
        { id: 'timesheets-approval', name: 'Timesheet Approval', icon: ClockIcon, path: '/timesheets/approval', roles: ['MANAGER'] },
        { id: 'timesheets-manage', name: 'Team Timesheets', icon: ClockIcon, path: '/timesheets/manage', roles: ['MANAGER'] }
      );
    }

    if (isEmployee()) {
      items.push(
        { id: 'timesheets-submit', name: 'Submit Timesheet', icon: ClockIcon, path: '/timesheets/submit', roles: ['EMPLOYEE'] },
        { id: 'timesheets-manage', name: 'My Timesheets', icon: ClockIcon, path: '/timesheets/manage', roles: ['EMPLOYEE'] }
      );
    }

    return items.filter(item => item.roles.includes(user?.role));
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">HR System</h1>
        <p className="text-gray-300 text-sm mt-1">{user?.role}</p>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-3 py-2 rounded-md text-left transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <div className="border-t border-gray-600 pt-4">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 rounded-full p-2 mr-3">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;