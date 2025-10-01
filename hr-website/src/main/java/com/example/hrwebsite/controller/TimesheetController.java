package com.example.hrwebsite.controller;

import com.example.hrwebsite.model.Timesheet;
import com.example.hrwebsite.repository.TimesheetRepository;
import com.example.hrwebsite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/timesheets")
public class TimesheetController {

    @Autowired
    private TimesheetRepository timesheetRepository;
    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> submitTimesheet(@Valid @RequestBody Timesheet timesheet, Principal principal) {
        com.example.hrwebsite.model.User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + principal.getName()));
        timesheet.setUserId(user.getId());
        timesheet.setDate(LocalDate.now());
        timesheet.setStatus("PENDING");
        timesheetRepository.save(timesheet);
        return ResponseEntity.ok("Timesheet submitted successfully");
    }

    @GetMapping
    public List<Timesheet> getTimesheetHistory(Principal principal) {
        com.example.hrwebsite.model.User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + principal.getName()));
        return timesheetRepository.findByUserId(user.getId());
    }
}
