package com.example.hrwebsite.controller;

import com.example.hrwebsite.dto.ApiResponse;
import com.example.hrwebsite.dto.TimesheetResponse;
import com.example.hrwebsite.dto.UserResponse;
import com.example.hrwebsite.model.Timesheet;
import com.example.hrwebsite.model.User;
import com.example.hrwebsite.service.TimesheetService;
import com.example.hrwebsite.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for manager-specific operations
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

    /**
     * Get all users (Manager only)
     * @return List of all users
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        logger.info("Manager request to get all users");
        
        List<User> users = userService.getAllUsers();
        List<UserResponse> userResponses = users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} users for manager", userResponses.size());
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", userResponses));
    }

    /**
     * Get all timesheets (Manager only)
     * @return List of all timesheets
     */
    @GetMapping("/timesheets")
    public ResponseEntity<ApiResponse<List<TimesheetResponse>>> getAllTimesheets() {
        logger.info("Manager request to get all timesheets");
        
        List<Timesheet> timesheets = timesheetService.getAllTimesheets();
        List<TimesheetResponse> timesheetResponses = timesheets.stream()
                .map(this::convertToTimesheetResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} timesheets for manager", timesheetResponses.size());
        return ResponseEntity.ok(ApiResponse.success("Timesheets retrieved successfully", timesheetResponses));
    }

    /**
     * Get pending timesheets for approval (Manager only)
     * @return List of pending timesheets
     */
    @GetMapping("/timesheets/pending")
    public ResponseEntity<ApiResponse<List<TimesheetResponse>>> getPendingTimesheets() {
        logger.info("Manager request to get pending timesheets");
        
        List<Timesheet> pendingTimesheets = timesheetService.getPendingTimesheets();
        List<TimesheetResponse> timesheetResponses = pendingTimesheets.stream()
                .map(this::convertToTimesheetResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} pending timesheets for manager", timesheetResponses.size());
        return ResponseEntity.ok(ApiResponse.success("Pending timesheets retrieved successfully", timesheetResponses));
    }

    /**
     * Get timesheets by status (Manager only)
     * @param status Status to filter by
     * @return List of timesheets with specified status
     */
    @GetMapping("/timesheets/status/{status}")
    public ResponseEntity<ApiResponse<List<TimesheetResponse>>> getTimesheetsByStatus(@PathVariable String status) {
        logger.info("Manager request to get timesheets with status: {}", status);
        
        List<Timesheet> timesheets = timesheetService.getTimesheetsByStatus(status.toUpperCase());
        List<TimesheetResponse> timesheetResponses = timesheets.stream()
                .map(this::convertToTimesheetResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} timesheets with status {} for manager", timesheetResponses.size(), status);
        return ResponseEntity.ok(ApiResponse.success("Timesheets with status " + status + " retrieved successfully", timesheetResponses));
    }

    /**
     * Approve timesheet (Manager only)
     * @param id Timesheet ID to approve
     * @return Updated timesheet details
     */
    @PutMapping("/timesheets/{id}/approve")
    public ResponseEntity<ApiResponse<TimesheetResponse>> approveTimesheet(@PathVariable Long id) {
        logger.info("Manager request to approve timesheet with ID: {}", id);
        
        Timesheet approvedTimesheet = timesheetService.approveTimesheet(id);
        TimesheetResponse response = convertToTimesheetResponse(approvedTimesheet);
        
        logger.info("Timesheet approved successfully with ID: {}", id);
        return ResponseEntity.ok(ApiResponse.success("Timesheet approved successfully", response));
    }

    /**
     * Reject timesheet (Manager only)
     * @param id Timesheet ID to reject
     * @return Updated timesheet details
     */
    @PutMapping("/timesheets/{id}/reject")
    public ResponseEntity<ApiResponse<TimesheetResponse>> rejectTimesheet(@PathVariable Long id) {
        logger.info("Manager request to reject timesheet with ID: {}", id);
        
        Timesheet rejectedTimesheet = timesheetService.rejectTimesheet(id);
        TimesheetResponse response = convertToTimesheetResponse(rejectedTimesheet);
        
        logger.info("Timesheet rejected successfully with ID: {}", id);
        return ResponseEntity.ok(ApiResponse.success("Timesheet rejected successfully", response));
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
        response.setDate(timesheet.getDate());
        response.setHours(timesheet.getHours());
        response.setProject(timesheet.getProject());
        response.setNotes(timesheet.getNotes());
        response.setStatus(timesheet.getStatus());
        
        // Convert User to UserResponse
        if (timesheet.getUser() != null) {
            response.setUser(convertToUserResponse(timesheet.getUser()));
        }
        
        return response;
    }
}
