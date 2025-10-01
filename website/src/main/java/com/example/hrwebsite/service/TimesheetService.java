package com.example.hrwebsite.service;

import com.example.hrwebsite.model.Timesheet;
import com.example.hrwebsite.model.User;
import com.example.hrwebsite.repository.TimesheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TimesheetService {
    
    @Autowired
    private TimesheetRepository timesheetRepository;
    
    @Autowired
    private UserService userService;
    
    /**
     * Get all timesheets
     * @return List of all timesheets
     */
    public List<Timesheet> getAllTimesheets() {
        return timesheetRepository.findAll();
    }
    
    /**
     * Get timesheets by user
     * @param user User whose timesheets to retrieve
     * @return List of user's timesheets
     */
    public List<Timesheet> getTimesheetsByUser(User user) {
        return timesheetRepository.findByUser(user);
    }
    
    /**
     * Get timesheet by ID
     * @param id Timesheet ID
     * @return Timesheet if found
     */
    public Optional<Timesheet> getTimesheetById(Long id) {
        return timesheetRepository.findById(id);
    }
    
    /**
     * Create a new timesheet
     * @param timesheet Timesheet to create
     * @param userEmail Email of user creating the timesheet
     * @return Created timesheet
     */
    public Timesheet createTimesheet(Timesheet timesheet, String userEmail) {
        User user = userService.findByEmail(userEmail);
        timesheet.setUser(user);
        
        // Set default status if not provided
        if (timesheet.getStatus() == null || timesheet.getStatus().isEmpty()) {
            timesheet.setStatus("PENDING");
        }
        
        // Set date to today if not provided
        if (timesheet.getDate() == null) {
            timesheet.setDate(LocalDate.now());
        }
        
        return timesheetRepository.save(timesheet);
    }
    
    /**
     * Update timesheet
     * @param id Timesheet ID
     * @param updatedTimesheet Updated timesheet data
     * @param userEmail Email of user updating the timesheet
     * @return Updated timesheet
     */
    public Timesheet updateTimesheet(Long id, Timesheet updatedTimesheet, String userEmail) {
        Timesheet existingTimesheet = timesheetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Timesheet not found with id: " + id));
        
        User user = userService.findByEmail(userEmail);
        
        // Check if user owns this timesheet or is a manager
        if (!existingTimesheet.getUser().getId().equals(user.getId()) && 
            !"MANAGER".equals(user.getRole())) {
            throw new RuntimeException("Access denied: You can only update your own timesheets");
        }
        
        existingTimesheet.setDate(updatedTimesheet.getDate());
        existingTimesheet.setHours(updatedTimesheet.getHours());
        existingTimesheet.setProject(updatedTimesheet.getProject());
        existingTimesheet.setNotes(updatedTimesheet.getNotes());
        
        return timesheetRepository.save(existingTimesheet);
    }
    
    /**
     * Approve timesheet (Manager only)
     * @param id Timesheet ID
     * @return Updated timesheet
     */
    public Timesheet approveTimesheet(Long id) {
        Timesheet timesheet = timesheetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Timesheet not found with id: " + id));
        
        timesheet.setStatus("APPROVED");
        return timesheetRepository.save(timesheet);
    }
    
    /**
     * Reject timesheet (Manager only)
     * @param id Timesheet ID
     * @return Updated timesheet
     */
    public Timesheet rejectTimesheet(Long id) {
        Timesheet timesheet = timesheetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Timesheet not found with id: " + id));
        
        timesheet.setStatus("REJECTED");
        return timesheetRepository.save(timesheet);
    }
    
    /**
     * Delete timesheet
     * @param id Timesheet ID
     * @param userEmail Email of user deleting the timesheet
     */
    public void deleteTimesheet(Long id, String userEmail) {
        Timesheet timesheet = timesheetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Timesheet not found with id: " + id));
        
        User user = userService.findByEmail(userEmail);
        
        // Check if user owns this timesheet or is a manager
        if (!timesheet.getUser().getId().equals(user.getId()) && 
            !"MANAGER".equals(user.getRole())) {
            throw new RuntimeException("Access denied: You can only delete your own timesheets");
        }
        
        timesheetRepository.deleteById(id);
    }
    
    /**
     * Get timesheets by status
     * @param status Status to filter by
     * @return List of timesheets with specified status
     */
    public List<Timesheet> getTimesheetsByStatus(String status) {
        return timesheetRepository.findByStatus(status);
    }
    
    /**
     * Get pending timesheets (for manager approval)
     * @return List of pending timesheets
     */
    public List<Timesheet> getPendingTimesheets() {
        return timesheetRepository.findByStatus("PENDING");
    }
}