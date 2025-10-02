import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState({}); // Store assignments by project ID
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    priority: 'MEDIUM',
    projectManagerId: ''
  });
  const [assignmentData, setAssignmentData] = useState({
    projectId: '',
    employeeId: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      fetchAssignments();
    }
  }, [projects]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/hr/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users for project assignment...');
      
      // Use HR endpoint for assignable users instead of admin endpoint
      const response = await axios.get('/api/hr/users');
      console.log('Users response:', response.data);
      
      // The HR endpoint already returns filtered managers and employees
      const assignableUsers = response.data.data || [];
      
      console.log('Assignable users:', assignableUsers);
      setUsers(assignableUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users for assignment');
    }
  };

  const fetchAssignments = async () => {
    try {
      console.log('Fetching assignments for all projects...', projects.length, 'projects');
      
      if (projects.length === 0) {
        console.log('No projects to fetch assignments for');
        return;
      }
      
      // Fetch assignments for each project
      const assignmentPromises = projects.map(async (project) => {
        try {
          console.log(`Fetching assignments for project ${project.id} (${project.name})`);
          const response = await axios.get(`/api/hr/assignments/project/${project.id}`);
          console.log(`Assignments for project ${project.id}:`, response.data.data);
          return {
            projectId: project.id,
            assignments: response.data.data || []
          };
        } catch (error) {
          console.error(`Error fetching assignments for project ${project.id}:`, error);
          if (error.response?.status === 404) {
            console.log(`No assignments found for project ${project.id}`);
          }
          return {
            projectId: project.id,
            assignments: []
          };
        }
      });

      const assignmentResults = await Promise.all(assignmentPromises);
      
      // Convert to object with project ID as key
      const assignmentMap = {};
      assignmentResults.forEach(result => {
        assignmentMap[result.projectId] = result.assignments;
      });
      
      setAssignments(assignmentMap);
      console.log('Final assignments loaded:', assignmentMap);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignmentData(prev => {
      // If project changes, clear the selected employee to prevent invalid selections
      if (name === 'projectId') {
        return {
          ...prev,
          [name]: value,
          employeeId: '' // Clear employee selection when project changes
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.description || !formData.startDate || !formData.endDate || !formData.projectManagerId) {
      toast.error('Please fill in all required fields including project manager');
      return;
    }

    // Validate project code format
    if (!/^[A-Z0-9_-]+$/.test(formData.code)) {
      toast.error('Project code must contain only uppercase letters, numbers, underscores, and hyphens');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      await axios.post('/api/hr/projects', formData);
      toast.success('Project created successfully!');
      
      setShowCreateModal(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        projectManagerId: ''
      });
      fetchProjects();
      
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      toast.error(errorMessage);
    }
  };

  const handleAssignEmployee = async (e) => {
    e.preventDefault();
    
    if (!assignmentData.projectId || !assignmentData.employeeId) {
      toast.error('Please select both project and team member');
      return;
    }

    // Check if user is already assigned to this project
    const projectAssignments = assignments[assignmentData.projectId] || [];
    const isAlreadyAssigned = projectAssignments.some(
      assignment => assignment.employee.id === parseInt(assignmentData.employeeId)
    );
    
    if (isAlreadyAssigned) {
      toast.error('This user is already assigned to the selected project');
      return;
    }

    try {
      console.log('Assigning user to project:', {
        projectId: parseInt(assignmentData.projectId),
        employeeId: parseInt(assignmentData.employeeId)
      });
      
      const response = await axios.post('/api/hr/assignments', {
        projectId: parseInt(assignmentData.projectId),
        employeeId: parseInt(assignmentData.employeeId)
      });
      
      console.log('Assignment response:', response.data);
      toast.success('Team member assigned to project successfully!');
      
      setShowAssignModal(false);
      setAssignmentData({
        projectId: '',
        employeeId: ''
      });
      
      // Refresh assignments after a short delay to ensure backend is updated
      setTimeout(() => {
        console.log('Refreshing assignments after assignment...');
        fetchAssignments();
      }, 500);
      
    } catch (error) {
      console.error('Error assigning user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to assign team member';
      toast.error(errorMessage);
    }
  };

  const handleUnassignUser = async (projectId, employeeId, employeeName) => {
    if (!window.confirm(`Are you sure you want to remove ${employeeName} from this project?`)) {
      return;
    }

    try {
      console.log('Unassigning user from project:', { projectId, employeeId });
      
      await axios.delete(`/api/hr/assignments/project/${projectId}/employee/${employeeId}`);
      
      toast.success(`${employeeName} removed from project successfully!`);
      
      // Refresh assignments to show the updated list
      setTimeout(() => {
        console.log('Refreshing assignments after removal...');
        fetchAssignments();
      }, 500);
      
    } catch (error) {
      console.error('Error removing user from project:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove user from project';
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProjectStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return { status: 'Not Started', color: 'bg-gray-100 text-gray-800' };
    if (now > end) return { status: 'Completed', color: 'bg-green-100 text-green-800' };
    return { status: 'Active', color: 'bg-blue-100 text-blue-800' };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Management</h1>
          <p className="text-gray-600">Create and manage projects, assign team members</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAssignModal(true)}
            className="btn-secondary"
          >
            Assign Team Member
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Project
          </button>
          <button
            onClick={() => {
              console.log('Manual refresh of assignments...');
              fetchAssignments();
              toast.info('Refreshing assignments...');
            }}
            className="btn-secondary bg-gray-100 hover:bg-gray-200"
          >
            Refresh Assignments
          </button>
          <button
            onClick={() => {
              console.log('=== DEBUG: Current Assignments ===');
              console.log('Assignments state:', assignments);
              console.log('Projects:', projects);
              console.log('Users:', users);
              
              Object.keys(assignments).forEach(projectId => {
                const project = projects.find(p => p.id === parseInt(projectId));
                console.log(`Project ${projectId} (${project?.name || 'Unknown'}):`, assignments[projectId]);
              });
            }}
            className="btn-secondary bg-yellow-100 hover:bg-yellow-200 text-xs"
          >
            Debug
          </button>
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to clear ALL assignments? This cannot be undone!')) {
                try {
                  await axios.delete('/api/hr/assignments/clear-all');
                  toast.success('All assignments cleared successfully!');
                  setTimeout(() => {
                    fetchAssignments();
                  }, 500);
                } catch (error) {
                  console.error('Error clearing assignments:', error);
                  const errorMessage = error.response?.data?.message || 'Failed to clear assignments';
                  toast.error(errorMessage);
                }
              }
            }}
            className="btn-secondary bg-red-100 hover:bg-red-200 text-xs text-red-700"
          >
            Clear All Assignments
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">All Projects ({projects.length})</h3>
        </div>
        <div className="card-body p-0">
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first project.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Team
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => {
                    const { status, color } = getProjectStatus(project.startDate, project.endDate);
                    return (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {project.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-600">
                            {project.code}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {project.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(project.startDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(project.endDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {/* Project Manager */}
                            {project.projectManager && (
                              <div className="mb-1">
                                <span className="font-medium text-blue-600">Manager:</span>
                                <span className="ml-1">{project.projectManager.name}</span>
                              </div>
                            )}
                            
                            {/* Assigned Team Members */}
                            {assignments[project.id] && assignments[project.id].length > 0 ? (
                              <div>
                                <span className="font-medium text-green-600">Team:</span>
                                <div className="ml-1">
                                  {assignments[project.id].map((assignment, index) => (
                                    <span key={assignment.id} className="text-sm">
                                      {assignment.employee.name}
                                      <span className="text-gray-500"> ({assignment.employee.role})</span>
                                      {index < assignments[project.id].length - 1 && ', '}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-xs">No team members assigned</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Project</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., PROJ-001, WEB_APP"
                    pattern="[A-Z0-9_-]+"
                    title="Only uppercase letters, numbers, underscores, and hyphens allowed"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use uppercase letters, numbers, underscores, and hyphens only</p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="projectManagerId" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Manager <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="projectManagerId"
                    name="projectManagerId"
                    value={formData.projectManagerId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a project manager</option>
                    {users
                      .filter(user => user.role === 'MANAGER')
                      .map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name} ({manager.email})
                        </option>
                      ))
                    }
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Only users with Manager role can be assigned as project managers
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ON_HOLD">On Hold</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Team Member Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assign Team Member to Project</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAssignEmployee} className="space-y-4">
                <div>
                  <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="projectId"
                    name="projectId"
                    value={assignmentData.projectId}
                    onChange={handleAssignmentChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show currently assigned users for selected project */}
                {assignmentData.projectId && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Currently Assigned to this Project:</h4>
                    {(() => {
                      const selectedProject = projects.find(p => p.id === parseInt(assignmentData.projectId));
                      const projectAssignments = assignments[assignmentData.projectId] || [];
                      
                      return (
                        <div className="space-y-1">
                          {/* Show Project Manager */}
                          {selectedProject?.projectManager && (
                            <div className="text-xs text-blue-600">
                              <strong>Manager:</strong> {selectedProject.projectManager.name}
                            </div>
                          )}
                          
                          {/* Show Assigned Team Members */}
                          {projectAssignments.length > 0 ? (
                            <div>
                              <div className="text-xs text-green-600 font-medium">Assigned Team:</div>
                              {projectAssignments.map((assignment) => (
                                <div key={assignment.id} className="text-xs text-gray-600 ml-2 flex justify-between items-center">
                                  <span>• {assignment.employee.name} ({assignment.employee.role})</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUnassignUser(assignment.project.id, assignment.employee.id, assignment.employee.name)}
                                    className="text-red-500 hover:text-red-700 text-xs ml-2"
                                    title="Remove from project"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">No team members assigned yet</div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div>
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                    Team Member <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="employeeId"
                    name="employeeId"
                    value={assignmentData.employeeId}
                    onChange={handleAssignmentChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a team member</option>
                    
                    {/* Get currently assigned users for the selected project */}
                    {(() => {
                      const selectedProjectAssignments = assignmentData.projectId ? 
                        assignments[assignmentData.projectId] || [] : [];
                      const assignedUserIds = selectedProjectAssignments.map(a => a.employee.id);
                      
                      const availableManagers = users
                        .filter(user => user.role === 'MANAGER' && !assignedUserIds.includes(user.id))
                        .sort((a, b) => a.name.localeCompare(b.name));
                        
                      const availableEmployees = users
                        .filter(user => user.role === 'EMPLOYEE' && !assignedUserIds.includes(user.id))
                        .sort((a, b) => a.name.localeCompare(b.name));
                      
                      return (
                        <>
                          {/* Managers Section */}
                          {availableManagers.length > 0 && (
                            <optgroup label="── Managers ──">
                              {availableManagers.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name} ({user.email}) - Manager
                                </option>
                              ))}
                            </optgroup>
                          )}
                          
                          {/* Employees Section */}
                          {availableEmployees.length > 0 && (
                            <optgroup label="── Employees ──">
                              {availableEmployees.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name} ({user.email}) - Employee
                                </option>
                              ))}
                            </optgroup>
                          )}
                          
                          {/* Show message if no users available */}
                          {availableManagers.length === 0 && availableEmployees.length === 0 && assignmentData.projectId && (
                            <option value="" disabled>All users are already assigned to this project</option>
                          )}
                        </>
                      );
                    })()}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Only unassigned managers and employees are shown. Users already assigned to the selected project are filtered out.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Assign Team Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;