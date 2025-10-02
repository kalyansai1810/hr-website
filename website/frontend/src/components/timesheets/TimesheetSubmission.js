import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TimesheetSubmission = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weekEndDate, setWeekEndDate] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [weeklyHours, setWeeklyHours] = useState({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  });
  const [descriptions, setDescriptions] = useState({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  });
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    fetchUserProjects();
    // Set current week start date (Monday)
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    // Calculate days to go back to Monday (1)
    // Sunday = 0, Monday = 1, Tuesday = 2, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days, otherwise go back (dayOfWeek - 1) days
    monday.setDate(today.getDate() - daysToSubtract);
    
    // Calculate end date (Sunday)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    // Format date properly to avoid timezone issues
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setWeekStartDate(formatDate(monday));
    setWeekEndDate(formatDate(sunday));
  }, []);

  // Feature-detect native date input support
  const supportsDateInput = (() => {
    try {
      const i = document.createElement('input');
      i.setAttribute('type', 'date');
      const supported = i.type === 'date' && typeof i.valueAsDate !== 'undefined';
      return supported;
    } catch (e) {
      return false;
    }
  })();

  const weekStartRef = useRef(null);
  const weekEndRef = useRef(null);

  const updateWeekEndDate = (startDate) => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const year = end.getFullYear();
    const month = String(end.getMonth() + 1).padStart(2, '0');
    const day = String(end.getDate()).padStart(2, '0');
    setWeekEndDate(`${year}-${month}-${day}`);
  };

  const handleWeekStartChange = (dateString) => {
    const selectedDate = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    const dayOfWeek = selectedDate.getDay();
    let newStartDate = dateString;
    if (dayOfWeek !== 1 && !useCustomRange) {
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      selectedDate.setDate(selectedDate.getDate() - daysToSubtract);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      newStartDate = `${year}-${month}-${day}`;
      toast.info(`Week adjusted to start on Monday: ${selectedDate.toLocaleDateString()}`);
    }
    setWeekStartDate(newStartDate);
    if (!useCustomRange) {
      updateWeekEndDate(newStartDate);
    }
    // Initialize state for all days in new range
    setTimeout(() => {
      const daysInRange = getDaysInRangeFor(newStartDate, useCustomRange ? weekEndDate : undefined);
      const newHours = {};
      const newDescriptions = {};
      daysInRange.forEach(dayInfo => {
        newHours[dayInfo.dayName] = weeklyHours[dayInfo.dayName] || '';
        newDescriptions[dayInfo.dayName] = descriptions[dayInfo.dayName] || '';
      });
      setWeeklyHours(newHours);
      setDescriptions(newDescriptions);
    }, 0);
  };

  const handleCustomRangeToggle = (enabled) => {
    setUseCustomRange(enabled);
    if (!enabled) {
      // Reset to Monday-Sunday week
      handleWeekStartChange(weekStartDate);
    } else {
      // When enabling custom, re-initialize state for the current range
      setTimeout(() => {
        const daysInRange = getDaysInRange();
        const newHours = {};
        const newDescriptions = {};
        daysInRange.forEach(dayInfo => {
          newHours[dayInfo.dayName] = weeklyHours[dayInfo.dayName] || '';
          newDescriptions[dayInfo.dayName] = descriptions[dayInfo.dayName] || '';
        });
        setWeeklyHours(newHours);
        setDescriptions(newDescriptions);
      }, 0);
    }
  };
  
// Helper to get days in range for any start/end
const getDaysInRangeFor = (start, end) => {
  if (!start || (!end && useCustomRange)) return [];
  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date((end || weekEndDate) + 'T00:00:00');
  const days = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    days.push({
      date: new Date(currentDate),
      dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
      displayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      dateString: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  // Ensure chronological order (ascending) before returning
  days.sort((a, b) => new Date(a.date) - new Date(b.date));
  return days;
};

// Always keep state in sync with range
useEffect(() => {
  const daysInRange = getDaysInRangeFor(weekStartDate, weekEndDate);
  const newHours = {};
  const newDescriptions = {};
  daysInRange.forEach(dayInfo => {
    newHours[dayInfo.dayName] = weeklyHours[dayInfo.dayName] || '';
    newDescriptions[dayInfo.dayName] = descriptions[dayInfo.dayName] || '';
  });
  setWeeklyHours(newHours);
  setDescriptions(newDescriptions);
  // eslint-disable-next-line
}, [weekStartDate, weekEndDate, useCustomRange]);

  const fetchUserProjects = async () => {
    try {
      setProjectsLoading(true);
      const response = await axios.get('/api/timesheets/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch assigned projects');
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleHoursChange = (day, value) => {
    setWeeklyHours(prev => ({
      ...prev,
      [day]: value
    }));
  };

  const handleDescriptionChange = (day, value) => {
    setDescriptions(prev => ({
      ...prev,
      [day]: value
    }));
  };

  const getDateForDay = (dayIndex) => {
    const startDate = new Date(weekStartDate + 'T00:00:00'); // Add time to avoid timezone issues
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + dayIndex);
    
    // Format date properly to avoid timezone issues
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekRange = () => {
    if (!weekStartDate || !weekEndDate) return '';
    
    const startDate = new Date(weekStartDate + 'T00:00:00'); // Add time to avoid timezone issues
    const endDate = new Date(weekEndDate + 'T00:00:00');
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: startDate.getFullYear() !== endDate.getFullYear() ? 'numeric' : undefined
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getDaysInRange = () => {
    if (!weekStartDate || !weekEndDate) return [];
    
    const startDate = new Date(weekStartDate + 'T00:00:00');
    const endDate = new Date(weekEndDate + 'T00:00:00');
    const days = [];
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      days.push({
        date: new Date(currentDate),
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
        displayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        dateString: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
      // Ensure chronological order (ascending)
      days.sort((a, b) => new Date(a.date) - new Date(b.date));
      return days;
  };

  const validateWeeklyTimesheet = () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return false;
    }

    let hasValidEntry = false;
    const daysInRange = getDaysInRange();
    
    for (const dayInfo of daysInRange) {
      const hours = parseFloat(weeklyHours[dayInfo.dayName]);
      if (weeklyHours[dayInfo.dayName] && (!isNaN(hours))) {
        if (hours < 0.5 || hours > 24) {
          toast.error(`Hours for ${dayInfo.displayName} must be between 0.5 and 24`);
          return false;
        }
        hasValidEntry = true;
      }
    }

    if (!hasValidEntry) {
      toast.error('Please enter hours for at least one day');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateWeeklyTimesheet()) {
      return;
    }

    try {
      setLoading(true);
      
      const daysInRange = getDaysInRange();
      const submissions = [];

      for (const dayInfo of daysInRange) {
        const hours = parseFloat(weeklyHours[dayInfo.dayName]);
        
        if (weeklyHours[dayInfo.dayName] && !isNaN(hours) && hours >= 0.5) {
          const submitData = {
            projectId: parseInt(selectedProject),
            date: dayInfo.dateString,
            hours: hours,
            description: descriptions[dayInfo.dayName] || '',
            notes: descriptions[dayInfo.dayName] || ''
          };
          submissions.push(submitData);
        }
      }

  // Debug: log outgoing submissions
  console.log('Submitting timesheet entries:', submissions);

  // Submit all timesheet entries
  // Ensure submissions are sent in chronological order
  submissions.sort((a, b) => new Date(a.date) - new Date(b.date));
  const promises = submissions.map(data => axios.post('/api/timesheets', data, { headers: { 'Content-Type': 'application/json' } }));
  await Promise.all(promises);

  toast.success(`Successfully submitted ${submissions.length} timesheet entries for the selected period!`);
      
      // Reset form
      const resetHours = {};
      const resetDescriptions = {};
      daysInRange.forEach(dayInfo => {
        resetHours[dayInfo.dayName] = '';
        resetDescriptions[dayInfo.dayName] = '';
      });
      
      setWeeklyHours(resetHours);
      setDescriptions(resetDescriptions);
      
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      const resp = error.response?.data;
      // Try to surface detailed validation errors from backend
      if (resp) {
        // Spring's default BindingResult structure may include 'errors' or 'fieldErrors'
        if (resp.fieldErrors && Array.isArray(resp.fieldErrors)) {
          resp.fieldErrors.forEach(fe => {
            const msg = fe.defaultMessage || fe.message || `${fe.field}: ${fe.code || 'invalid'}`;
            toast.error(`${fe.field}: ${msg}`);
          });
        } else if (resp.errors && Array.isArray(resp.errors)) {
          resp.errors.forEach(err => {
            const msg = err.defaultMessage || err.message || JSON.stringify(err);
            toast.error(msg);
          });
        } else if (typeof resp === 'string') {
          toast.error(resp);
        } else if (resp.message) {
          toast.error(resp.message);
        } else {
          toast.error('Validation failed - see console for details');
          console.error('Validation response:', resp);
        }
      } else {
        toast.error('Failed to submit timesheet entries (no response)');
      }
    } finally {
      setLoading(false);
    }
  };

  if (projectsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const days = [
    { key: 'monday', label: 'Monday', index: 0 },
    { key: 'tuesday', label: 'Tuesday', index: 1 },
    { key: 'wednesday', label: 'Wednesday', index: 2 },
    { key: 'thursday', label: 'Thursday', index: 3 },
    { key: 'friday', label: 'Friday', index: 4 },
    { key: 'saturday', label: 'Saturday', index: 5 },
    { key: 'sunday', label: 'Sunday', index: 6 }
  ];

  const getTotalHours = () => {
    return Object.values(weeklyHours).reduce((total, hours) => {
      const parsed = parseFloat(hours);
      return total + (isNaN(parsed) ? 0 : parsed);
    }, 0);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Weekly Timesheet</h1>
        <p className="text-gray-600">Record your work hours for the entire week</p>
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects assigned</h3>
            <p className="mt-1 text-sm text-gray-500">
              You need to be assigned to a project before you can submit timesheets.
              Please contact your HR department.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Weekly Timesheet Entry</h3>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-600">
                  Week: {getWeekRange()}
                </p>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  7 days total
                </span>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Selection */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                      Project <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="projectId"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
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
                </div>

                {/* Date Range Selection */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Date Range Selection</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={useCustomRange}
                        onChange={(e) => handleCustomRangeToggle(e.target.checked)}
                        className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-600">Custom date range</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="weekStart" className="block text-sm font-medium text-gray-700 mb-1">
                        {useCustomRange ? 'Start Date' : 'Week Starting (Monday)'} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          ref={weekStartRef}
                          type="date"
                          id="weekStart"
                          value={weekStartDate}
                          onChange={(e) => handleWeekStartChange(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {!supportsDateInput && (
                          <button
                            type="button"
                            onClick={() => weekStartRef.current && weekStartRef.current.showPicker && weekStartRef.current.showPicker()}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800"
                            aria-label="Open calendar"
                          >
                            📅
                          </button>
                        )}
                      </div>
                      {!useCustomRange && (
                        <p className="text-xs text-gray-500 mt-1">
                          Will auto-adjust to nearest Monday if needed
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="weekEnd" className="block text-sm font-medium text-gray-700 mb-1">
                        {useCustomRange ? 'End Date' : 'Week Ending (Sunday)'} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          ref={weekEndRef}
                          type="date"
                          id="weekEnd"
                          value={weekEndDate}
                          onChange={(e) => setWeekEndDate(e.target.value)}
                          required
                          disabled={!useCustomRange}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${!useCustomRange ? 'bg-gray-100' : ''}`}
                        />
                        {!supportsDateInput && (
                          <button
                            type="button"
                            onClick={() => weekEndRef.current && weekEndRef.current.showPicker && weekEndRef.current.showPicker()}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800"
                            aria-label="Open calendar"
                          >
                            📅
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {useCustomRange ? 'Select any end date' : 'Auto-calculated (6 days after start)'}
                      </p>
                    </div>
                  </div>

                  {/* Current Range Display */}
                  <div className="mt-3 p-2 bg-white border rounded text-center">
                    <span className="text-sm font-medium text-gray-700">
                      Selected Range: {getWeekRange()}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({getDaysInRange().length} days)
                    </span>
                  </div>
                </div>

                {/* Week Navigation */}
                {!useCustomRange && (
                  <div className="flex items-center justify-center space-x-4 py-2 bg-gray-50 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        const currentWeek = new Date(weekStartDate + 'T00:00:00');
                        currentWeek.setDate(currentWeek.getDate() - 7);
                        const newStartDate = `${currentWeek.getFullYear()}-${String(currentWeek.getMonth() + 1).padStart(2, '0')}-${String(currentWeek.getDate()).padStart(2, '0')}`;
                        setWeekStartDate(newStartDate);
                        updateWeekEndDate(newStartDate);
                      }}
                      className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous Week
                    </button>
                    
                    <span className="text-sm font-medium text-gray-700 px-4 py-1 bg-white rounded border">
                      {getWeekRange()}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const currentWeek = new Date(weekStartDate + 'T00:00:00');
                        currentWeek.setDate(currentWeek.getDate() + 7);
                        const newStartDate = `${currentWeek.getFullYear()}-${String(currentWeek.getMonth() + 1).padStart(2, '0')}-${String(currentWeek.getDate()).padStart(2, '0')}`;
                        setWeekStartDate(newStartDate);
                        updateWeekEndDate(newStartDate);
                      }}
                      className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                    >
                      Next Week
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Hours Grid */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Day
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getDaysInRange().map((dayInfo, index) => (
                        <tr key={dayInfo.dateString} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {dayInfo.displayName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dayInfo.date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0.5"
                              max="24"
                              step="0.5"
                              value={weeklyHours[dayInfo.dayName] || ''}
                              onChange={(e) => handleHoursChange(dayInfo.dayName, e.target.value)}
                              placeholder="0.0"
                              className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={descriptions[dayInfo.dayName] || ''}
                              onChange={(e) => handleDescriptionChange(dayInfo.dayName, e.target.value)}
                              placeholder="Work description (optional)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {getTotalHours().toFixed(1)} hrs
                        </td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      const daysInRange = getDaysInRange();
                      const resetHours = {};
                      const resetDescriptions = {};
                      daysInRange.forEach(dayInfo => {
                        resetHours[dayInfo.dayName] = '';
                        resetDescriptions[dayInfo.dayName] = '';
                      });
                      setWeeklyHours(resetHours);
                      setDescriptions(resetDescriptions);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear All
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                      ${loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                  >
                    {loading ? 'Submitting...' : 'Submit Weekly Timesheet'}
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

export default TimesheetSubmission;
