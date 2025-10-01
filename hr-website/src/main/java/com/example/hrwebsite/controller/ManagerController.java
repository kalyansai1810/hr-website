package com.example.hrwebsite.controller;

import com.example.hrwebsite.model.Timesheet;
import com.example.hrwebsite.repository.TimesheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasRole('Manager')")
public class ManagerController {

    @Autowired
    private TimesheetRepository timesheetRepository;

    @GetMapping("/timesheets")
    public List<Timesheet> getAllTimesheets() {
        return timesheetRepository.findAll();
    }

    @PostMapping("/timesheets/{id}/approve")
    public ResponseEntity<?> approveTimesheet(@PathVariable Long id) {
        Timesheet timesheet = timesheetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Timesheet not found with id: " + id));
        timesheet.setStatus("APPROVED");
        timesheetRepository.save(timesheet);
        return ResponseEntity.ok("Timesheet approved successfully");
    }

    @PostMapping("/timesheets/{id}/reject")
    public ResponseEntity<?> rejectTimesheet(@PathVariable Long id) {
        Timesheet timesheet = timesheetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Timesheet not found with id: " + id));
        timesheet.setStatus("REJECTED");
        timesheetRepository.save(timesheet);
        return ResponseEntity.ok("Timesheet rejected successfully");
    }
}
