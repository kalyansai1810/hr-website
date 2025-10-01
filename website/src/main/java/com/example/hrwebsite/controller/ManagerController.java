package com.example.hrwebsite.controller;

import com.example.hrwebsite.dto.ApiResponse;
import com.example.hrwebsite.dto.AssignmentResponse;
import com.example.hrwebsite.dto.ProjectResponse;
import com.example.hrwebsite.dto.TimesheetResponse;
import com.example.hrwebsite.dto.UserResponse;
import com.example.hrwebsite.model.EmployeeProjectAssignment;
import com.example.hrwebsite.model.Project;
import com.example.hrwebsite.model.Timesheet;
import com.example.hrwebsite.model.User;
import com.example.hrwebsite.service.AuthService;
import com.example.hrwebsite.service.EmployeeProjectAssignmentService;
import com.example.hrwebsite.service.ProjectService;
import com.example.hrwebsite.service.TimesheetService;
import com.example.hrwebsite.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for manager-specific operations
 * Managers can only see and manage employees assigned to them
 */
@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasRole('MANAGER')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ManagerController {
    
    private static final Logger logger = LoggerFactory.getLogger(ManagerController.class);

    @Autowired
    private TimesheetService timesheetService;

    @Autowired
    private UserService userService;
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private ProjectService projectService;
    
    @Autowired
    private EmployeeProjectAssignmentService assignmentService;

    /**
     * Get employees managed by this manager (Manager only)
     * @param principal Current authenticated user
     * @return List of employees assigned to this manager
     */
    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getManagedEmployees(Principal principal) {
        logger.info("Manager request to get managed employees");
        
        User currentManager = authService.getCurrentUser();
        List<User> managedEmployees = userService.getEmployeesByManager(currentManager.getId());
        List<UserResponse> userResponses = managedEmployees.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} managed employees for manager: {}", userResponses.size(), currentManager.getName());
        return ResponseEntity.ok(ApiResponse.success("Managed employees retrieved successfully", userResponses));
    }

    /**
     * Get projects managed by this manager (Manager only)
     * @param principal Current authenticated user
     * @return List of projects assigned to this manager
     */
    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getManagedProjects(Principal principal) {
        logger.info("Manager request to get managed projects");
        
        User currentManager = authService.getCurrentUser();
        List<Project> managedProjects = projectService.getProjectsByManager(currentManager.getId());
        List<ProjectResponse> projectResponses = managedProjects.stream()
                .map(this::convertToProjectResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} managed projects for manager: {}", projectResponses.size(), currentManager.getName());
        return ResponseEntity.ok(ApiResponse.success("Managed projects retrieved successfully", projectResponses));
    }

    /**
     * Get assignments for managed employees (Manager only)
     * @param principal Current authenticated user
     * @return List of assignments for employees managed by this manager
     */
    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getManagedAssignments(Principal principal) {
        logger.info("Manager request to get assignments for managed employees");
        
        User currentManager = authService.getCurrentUser();
        List<EmployeeProjectAssignment> assignments = assignmentService.getAssignmentsByManager(currentManager.getId());
        List<AssignmentResponse> assignmentResponses = assignments.stream()
                .map(this::convertToAssignmentResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} assignments for managed employees", assignmentResponses.size());
        return ResponseEntity.ok(ApiResponse.success("Managed assignments retrieved successfully", assignmentResponses));
    }

    /**
     * Get timesheets from managed employees (Manager only)
     * @param principal Current authenticated user
     * @return List of timesheets from employees assigned to this manager
     */
    @GetMapping("/timesheets")
    public ResponseEntity<ApiResponse<List<TimesheetResponse>>> getManagedTimesheets(Principal principal) {
        logger.info("Manager request to get timesheets from managed employees");
        
        User currentManager = authService.getCurrentUser();
        List<Timesheet> allTimesheets = timesheetService.getAllTimesheets();
        
        // Filter timesheets to only show those from managed employees
        List<User> managedEmployees = userService.getEmployeesByManager(currentManager.getId());
        List<Long> managedEmployeeIds = managedEmployees.stream()
                .map(User::getId)
                .collect(Collectors.toList());
        
        List<Timesheet> timesheets = allTimesheets.stream()
                .filter(ts -> managedEmployeeIds.contains(ts.getUser().getId()))
                .collect(Collectors.toList());
        List<TimesheetResponse> timesheetResponses = timesheets.stream()
                .map(this::convertToTimesheetResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} timesheets from managed employees", timesheetResponses.size());
        return ResponseEntity.ok(ApiResponse.success("Managed timesheets retrieved successfully", timesheetResponses));
    }

    /**
     * Get pending timesheets for approval from managed employees (Manager only)
     * @param principal Current authenticated user
     * @return List of pending timesheets from managed employees
     */
    @GetMapping("/timesheets/pending")
    public ResponseEntity<ApiResponse<List<TimesheetResponse>>> getPendingManagedTimesheets(Principal principal) {
        logger.info("Manager request to get pending timesheets from managed employees");
        
        User currentManager = authService.getCurrentUser();
        List<Timesheet> allPendingTimesheets = timesheetService.getPendingTimesheets();
        
        // Filter timesheets to only show those from managed employees
        List<User> managedEmployees = userService.getEmployeesByManager(currentManager.getId());
        List<Long> managedEmployeeIds = managedEmployees.stream()
                .map(User::getId)
                .collect(Collectors.toList());
        
        List<Timesheet> pendingTimesheets = allPendingTimesheets.stream()
                .filter(ts -> managedEmployeeIds.contains(ts.getUser().getId()))
                .collect(Collectors.toList());
        List<TimesheetResponse> timesheetResponses = pendingTimesheets.stream()
                .map(this::convertToTimesheetResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} pending timesheets from managed employees", timesheetResponses.size());
        return ResponseEntity.ok(ApiResponse.success("Pending managed timesheets retrieved successfully", timesheetResponses));
    }

    /**
     * Get timesheets by status from managed employees (Manager only)
     * @param status Status to filter by
     * @param principal Current authenticated user
     * @return List of timesheets with specified status from managed employees
     */
    @GetMapping("/timesheets/status/{status}")
    public ResponseEntity<ApiResponse<List<TimesheetResponse>>> getManagedTimesheetsByStatus(
            @PathVariable String status, Principal principal) {
        logger.info("Manager request to get managed timesheets with status: {}", status);
        
        User currentManager = authService.getCurrentUser();
        List<Timesheet> allTimesheets = timesheetService.getTimesheetsByStatus(status.toUpperCase());
        
        // Filter timesheets to only show those from managed employees
        List<User> managedEmployees = userService.getEmployeesByManager(currentManager.getId());
        List<Long> managedEmployeeIds = managedEmployees.stream()
                .map(User::getId)
                .collect(Collectors.toList());
        
        List<Timesheet> timesheets = allTimesheets.stream()
                .filter(ts -> managedEmployeeIds.contains(ts.getUser().getId()))
                .collect(Collectors.toList());
        List<TimesheetResponse> timesheetResponses = timesheets.stream()
                .map(this::convertToTimesheetResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} managed timesheets with status {}", timesheetResponses.size(), status);
        return ResponseEntity.ok(ApiResponse.success("Managed timesheets with status " + status + " retrieved successfully", timesheetResponses));
    }

    /**
     * Get timesheets for a specific managed employee (Manager only)
     * @param employeeId Employee ID
     * @param principal Current authenticated user
     * @return List of timesheets for the specified employee
     */
    @GetMapping("/timesheets/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<TimesheetResponse>>> getTimesheetsForManagedEmployee(
            @PathVariable Long employeeId, Principal principal) {
        logger.info("Manager request to get timesheets for managed employee: {}", employeeId);
        
        User currentManager = authService.getCurrentUser();
        
        // Verify that the employee is managed by this manager
        List<User> managedEmployees = userService.getEmployeesByManager(currentManager.getId());
        boolean isManaged = managedEmployees.stream().anyMatch(emp -> emp.getId().equals(employeeId));
        
        if (!isManaged) {
            throw new RuntimeException("Employee is not managed by current manager");
        }
        
        User employee = userService.getUserById(employeeId);
        List<Timesheet> timesheets = timesheetService.getTimesheetsByUser(employee);
        List<TimesheetResponse> timesheetResponses = timesheets.stream()
                .map(this::convertToTimesheetResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} timesheets for managed employee: {}", timesheetResponses.size(), employeeId);
        return ResponseEntity.ok(ApiResponse.success("Employee timesheets retrieved successfully", timesheetResponses));
    }

    /**
     * Approve timesheet (Manager only)
     * @param id Timesheet ID to approve
     * @param principal Current authenticated user
     * @return Updated timesheet details
     */
    @PutMapping("/timesheets/{id}/approve")
    public ResponseEntity<ApiResponse<TimesheetResponse>> approveTimesheet(@PathVariable Long id, Principal principal) {
        logger.info("Manager request to approve timesheet with ID: {}", id);
        
        User currentManager = authService.getCurrentUser();
        
        // Verify that the timesheet belongs to a managed employee
        Timesheet timesheet = timesheetService.getTimesheetById(id)
            .orElseThrow(() -> new RuntimeException("Timesheet not found with ID: " + id));
        List<User> managedEmployees = userService.getEmployeesByManager(currentManager.getId());
        boolean isManaged = managedEmployees.stream().anyMatch(emp -> emp.getId().equals(timesheet.getUser().getId()));
        
        if (!isManaged) {
            throw new RuntimeException("Cannot approve timesheet - employee is not managed by current manager");
        }
        
        Timesheet approvedTimesheet = timesheetService.approveTimesheet(id);
        TimesheetResponse response = convertToTimesheetResponse(approvedTimesheet);
        
        logger.info("Timesheet approved successfully with ID: {}", id);
        return ResponseEntity.ok(ApiResponse.success("Timesheet approved successfully", response));
    }

    /**
     * Reject timesheet (Manager only)
     * @param id Timesheet ID to reject
     * @param principal Current authenticated user
     * @return Updated timesheet details
     */
    @PutMapping("/timesheets/{id}/reject")
    public ResponseEntity<ApiResponse<TimesheetResponse>> rejectTimesheet(@PathVariable Long id, Principal principal) {
        logger.info("Manager request to reject timesheet with ID: {}", id);
        
        User currentManager = authService.getCurrentUser();
        
        // Verify that the timesheet belongs to a managed employee
        Timesheet timesheet = timesheetService.getTimesheetById(id)
            .orElseThrow(() -> new RuntimeException("Timesheet not found with ID: " + id));
        List<User> managedEmployees = userService.getEmployeesByManager(currentManager.getId());
        boolean isManaged = managedEmployees.stream().anyMatch(emp -> emp.getId().equals(timesheet.getUser().getId()));
        
        if (!isManaged) {
            throw new RuntimeException("Cannot reject timesheet - employee is not managed by current manager");
        }
        
        Timesheet rejectedTimesheet = timesheetService.rejectTimesheet(id);
        TimesheetResponse response = convertToTimesheetResponse(rejectedTimesheet);
        
        logger.info("Timesheet rejected successfully with ID: {}", id);
        return ResponseEntity.ok(ApiResponse.success("Timesheet rejected successfully", response));
    }

    // ===============================
    // CONVERSION METHODS
    // ===============================

    /**
     * Convert User entity to UserResponse DTO
     * @param user User entity
     * @return UserResponse DTO
     */
    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setEmployeeId(user.getEmployeeId());
        response.setDepartment(user.getDepartment());
        response.setJobTitle(user.getJobTitle());
        response.setActive(user.getActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        
        if (user.getManager() != null) {
            response.setManagerId(user.getManager().getId());
            response.setManagerName(user.getManager().getName());
        }
        
        return response;
    }

    /**
     * Convert Project entity to ProjectResponse DTO
     * @param project Project entity
     * @return ProjectResponse DTO
     */
    private ProjectResponse convertToProjectResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setStartDate(project.getStartDate());
        response.setEndDate(project.getEndDate());
        response.setStatus(project.getStatus());
        response.setPriority(project.getPriority());
        response.setBudget(project.getBudget());
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());
        
        if (project.getProjectManager() != null) {
            UserResponse projectManagerResponse = convertToUserResponse(project.getProjectManager());
            response.setProjectManager(projectManagerResponse);
        }
        
        if (project.getCreatedBy() != null) {
            UserResponse createdByResponse = convertToUserResponse(project.getCreatedBy());
            response.setCreatedBy(createdByResponse);
        }
        
        return response;
    }

    /**
     * Convert EmployeeProjectAssignment entity to AssignmentResponse DTO
     * @param assignment Assignment entity
     * @return AssignmentResponse DTO
     */
    private AssignmentResponse convertToAssignmentResponse(EmployeeProjectAssignment assignment) {
        AssignmentResponse response = new AssignmentResponse();
        response.setId(assignment.getId());
        response.setEmployee(convertToUserResponse(assignment.getEmployee()));
        response.setProject(convertToProjectResponse(assignment.getProject()));
        response.setRole(assignment.getRole());
        response.setAllocatedHours(assignment.getAllocatedHours());
        response.setCreatedAt(assignment.getCreatedAt());
        response.setUpdatedAt(assignment.getUpdatedAt());
        
        if (assignment.getAssignedBy() != null) {
            response.setAssignedBy(convertToUserResponse(assignment.getAssignedBy()));
        }
        
        return response;
    }

    /**
     * Convert Timesheet entity to TimesheetResponse DTO
     * @param timesheet Timesheet entity
     * @return TimesheetResponse DTO
     */
    private TimesheetResponse convertToTimesheetResponse(Timesheet timesheet) {
        TimesheetResponse response = new TimesheetResponse();
        response.setId(timesheet.getId());
        response.setUser(convertToUserResponse(timesheet.getUser()));
        
        if (timesheet.getProject() != null) {
            response.setProject(convertToProjectResponse(timesheet.getProject()));
        }
        
        response.setDate(timesheet.getDate());
        response.setStartTime(timesheet.getStartTime());
        response.setEndTime(timesheet.getEndTime());
        response.setHours(timesheet.getHours());
        response.setNotes(timesheet.getNotes());
        response.setStatus(timesheet.getStatus());
        response.setCreatedAt(timesheet.getCreatedAt());
        response.setUpdatedAt(timesheet.getUpdatedAt());
        
        if (timesheet.getReviewedBy() != null) {
            response.setReviewedBy(convertToUserResponse(timesheet.getReviewedBy()));
        }
        
        return response;
    }
}
