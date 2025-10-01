package com.example.hrwebsite.controller;

import com.example.hrwebsite.dto.ApiResponse;
import com.example.hrwebsite.dto.ProjectResponse;
import com.example.hrwebsite.dto.TimesheetRequest;
import com.example.hrwebsite.dto.TimesheetResponse;
import com.example.hrwebsite.dto.UserResponse;
import com.example.hrwebsite.model.Project;
import com.example.hrwebsite.model.Timesheet;
import com.example.hrwebsite.model.User;
import com.example.hrwebsite.service.AuthService;
import com.example.hrwebsite.service.EmployeeProjectAssignmentService;
import com.example.hrwebsite.service.ProjectService;
import com.example.hrwebsite.service.TimesheetService;
import jakarta.validation.Valid;
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
 * Controller for timesheet operations
 * Employees can only submit timesheets for projects they are assigned to
 */
@RestController
@RequestMapping("/api/timesheets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TimesheetController {
    
    private static final Logger logger = LoggerFactory.getLogger(TimesheetController.class);
    
    @Autowired
    private TimesheetService timesheetService;
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private ProjectService projectService;
    
    @Autowired
    private EmployeeProjectAssignmentService assignmentService;

    /**
     * Submit a new timesheet
     * @param timesheetRequest Timesheet data
     * @param principal Current authenticated user
     * @return Created timesheet details
     */
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<TimesheetResponse>> submitTimesheet(
            @Valid @RequestBody TimesheetRequest timesheetRequest, 
            Principal principal) {
        
        logger.info("Timesheet submission request from user: {}", principal.getName());
        
        User currentUser = authService.getCurrentUser();
        
        // Validate project assignment for employees
        if (currentUser.isEmployee() && timesheetRequest.getProjectId() != null) {
            boolean isAssigned = assignmentService.isEmployeeAssignedToProject(
                currentUser.getId(), 
                timesheetRequest.getProjectId()
            );
            
            if (!isAssigned) {
                throw new RuntimeException("You can only submit timesheets for projects you are assigned to");
            }
        }
        
        // Convert DTO to Entity
        Timesheet timesheet = new Timesheet();
        timesheet.setDate(timesheetRequest.getDate());
        timesheet.setStartTime(timesheetRequest.getStartTime());
        timesheet.setEndTime(timesheetRequest.getEndTime());
        timesheet.setHours(timesheetRequest.getHours());
        timesheet.setNotes(timesheetRequest.getNotes());
        
        // Set project if provided
        if (timesheetRequest.getProjectId() != null) {
            Project project = projectService.getProjectById(timesheetRequest.getProjectId());
            timesheet.setProject(project);
        }
        
        Timesheet createdTimesheet = timesheetService.createTimesheet(timesheet, principal.getName());
        
        // Fetch the timesheet with relationships to avoid lazy loading issues
        Timesheet timesheetWithRelations = timesheetService.getTimesheetById(createdTimesheet.getId())
            .orElseThrow(() -> new RuntimeException("Failed to retrieve created timesheet"));
        
        TimesheetResponse response = convertToTimesheetResponse(timesheetWithRelations);
        
        logger.info("Timesheet created successfully with ID: {}", createdTimesheet.getId());
        return ResponseEntity.ok(ApiResponse.success("Timesheet submitted successfully", response));
    }
    
    /**
     * Get user's timesheet history
     * @param principal Current authenticated user
     * @return List of user's timesheets
     */
    @GetMapping
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<TimesheetResponse>>> getTimesheetHistory(Principal principal) {
        logger.info("Timesheet history request from user: {}", principal.getName());
        
        User user = authService.getCurrentUser();
        List<Timesheet> timesheets = timesheetService.getTimesheetsByUser(user);
        
        List<TimesheetResponse> response = timesheets.stream()
                .map(this::convertToTimesheetResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} timesheets for user: {}", response.size(), principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Timesheets retrieved successfully", response));
    }

    /**
     * Get projects assigned to current employee
     * @param principal Current authenticated user
     * @return List of assigned projects
     */
    @GetMapping("/projects")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getAssignedProjects(Principal principal) {
        logger.info("Assigned projects request from user: {}", principal.getName());
        
        User currentUser = authService.getCurrentUser();
        List<Project> assignedProjects = projectService.getProjectsByEmployee(currentUser.getId());
        
        List<ProjectResponse> response = assignedProjects.stream()
                .map(this::convertToProjectResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} assigned projects for user: {}", response.size(), principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Assigned projects retrieved successfully", response));
    }
    
    /**
     * Get timesheet by ID
     * @param id Timesheet ID
     * @param principal Current authenticated user
     * @return Timesheet details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<TimesheetResponse>> getTimesheet(
            @PathVariable Long id, 
            Principal principal) {
        
        logger.info("Timesheet details request for ID: {} from user: {}", id, principal.getName());
        
        Timesheet timesheet = timesheetService.getTimesheetById(id)
                .orElseThrow(() -> new RuntimeException("Timesheet not found with id: " + id));
        
        User currentUser = authService.getCurrentUser();
        
        // Ensure users can only access their own timesheets (unless they are managers)
        if (currentUser.isEmployee() && !timesheet.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only access your own timesheets");
        }
        
        TimesheetResponse response = convertToTimesheetResponse(timesheet);
        
        return ResponseEntity.ok(ApiResponse.success("Timesheet details retrieved", response));
    }
    
    /**
     * Update timesheet
     * @param id Timesheet ID
     * @param timesheetRequest Updated timesheet data
     * @param principal Current authenticated user
     * @return Updated timesheet details
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<TimesheetResponse>> updateTimesheet(
            @PathVariable Long id,
            @Valid @RequestBody TimesheetRequest timesheetRequest,
            Principal principal) {
        
        logger.info("Timesheet update request for ID: {} from user: {}", id, principal.getName());
        
        User currentUser = authService.getCurrentUser();
        
        // Get existing timesheet
        Timesheet existingTimesheet = timesheetService.getTimesheetById(id)
                .orElseThrow(() -> new RuntimeException("Timesheet not found with id: " + id));
        
        // Ensure users can only update their own timesheets
        if (currentUser.isEmployee() && !existingTimesheet.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only update your own timesheets");
        }
        
        // Validate project assignment for employees if project is being changed
        if (currentUser.isEmployee() && timesheetRequest.getProjectId() != null) {
            boolean isAssigned = assignmentService.isEmployeeAssignedToProject(
                currentUser.getId(), 
                timesheetRequest.getProjectId()
            );
            
            if (!isAssigned) {
                throw new RuntimeException("You can only submit timesheets for projects you are assigned to");
            }
        }
        
        // Convert DTO to Entity
        Timesheet timesheet = new Timesheet();
        timesheet.setDate(timesheetRequest.getDate());
        timesheet.setStartTime(timesheetRequest.getStartTime());
        timesheet.setEndTime(timesheetRequest.getEndTime());
        timesheet.setHours(timesheetRequest.getHours());
        timesheet.setNotes(timesheetRequest.getNotes());
        
        // Set project if provided
        if (timesheetRequest.getProjectId() != null) {
            Project project = projectService.getProjectById(timesheetRequest.getProjectId());
            timesheet.setProject(project);
        }
        
        Timesheet updatedTimesheet = timesheetService.updateTimesheet(id, timesheet, principal.getName());
        TimesheetResponse response = convertToTimesheetResponse(updatedTimesheet);
        
        logger.info("Timesheet updated successfully with ID: {}", id);
        return ResponseEntity.ok(ApiResponse.success("Timesheet updated successfully", response));
    }
    
    /**
     * Delete timesheet
     * @param id Timesheet ID
     * @param principal Current authenticated user
     * @return Deletion confirmation
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Object>> deleteTimesheet(
            @PathVariable Long id, 
            Principal principal) {
        
        logger.info("Timesheet deletion request for ID: {} from user: {}", id, principal.getName());
        
        User currentUser = authService.getCurrentUser();
        
        // Get existing timesheet
        Timesheet existingTimesheet = timesheetService.getTimesheetById(id)
                .orElseThrow(() -> new RuntimeException("Timesheet not found with id: " + id));
        
        // Ensure users can only delete their own timesheets
        if (currentUser.isEmployee() && !existingTimesheet.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own timesheets");
        }
        
        timesheetService.deleteTimesheet(id, principal.getName());
        
        logger.info("Timesheet deleted successfully with ID: {}", id);
        return ResponseEntity.ok(ApiResponse.success("Timesheet deleted successfully", null));
    }

    // ===============================
    // CONVERSION METHODS
    // ===============================

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
}
