package com.example.hrwebsite.controller;

import com.example.hrwebsite.dto.ApiResponse;
import com.example.hrwebsite.dto.TimesheetRequest;
import com.example.hrwebsite.dto.TimesheetResponse;
import com.example.hrwebsite.dto.UserResponse;
import com.example.hrwebsite.model.Timesheet;
import com.example.hrwebsite.service.AuthService;
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
        
        // Convert DTO to Entity
        Timesheet timesheet = new Timesheet();
        timesheet.setDate(timesheetRequest.getDate());
        timesheet.setHours(timesheetRequest.getHours());
        timesheet.setProject(timesheetRequest.getProject());
        timesheet.setNotes(timesheetRequest.getNotes());
        
        Timesheet createdTimesheet = timesheetService.createTimesheet(timesheet, principal.getName());
        TimesheetResponse response = convertToTimesheetResponse(createdTimesheet);
        
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
        
        var user = authService.getCurrentUser();
        List<Timesheet> timesheets = timesheetService.getTimesheetsByUser(user);
        
        List<TimesheetResponse> response = timesheets.stream()
                .map(this::convertToTimesheetResponse)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} timesheets for user: {}", response.size(), principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Timesheets retrieved successfully", response));
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
        
        // Convert DTO to Entity
        Timesheet timesheet = new Timesheet();
        timesheet.setDate(timesheetRequest.getDate());
        timesheet.setHours(timesheetRequest.getHours());
        timesheet.setProject(timesheetRequest.getProject());
        timesheet.setNotes(timesheetRequest.getNotes());
        
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
        
        timesheetService.deleteTimesheet(id, principal.getName());
        
        logger.info("Timesheet deleted successfully with ID: {}", id);
        return ResponseEntity.ok(ApiResponse.success("Timesheet deleted successfully", null));
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
            UserResponse userResponse = new UserResponse();
            userResponse.setId(timesheet.getUser().getId());
            userResponse.setName(timesheet.getUser().getName());
            userResponse.setEmail(timesheet.getUser().getEmail());
            userResponse.setRole(timesheet.getUser().getRole());
            response.setUser(userResponse);
        }
        
        return response;
    }
}
