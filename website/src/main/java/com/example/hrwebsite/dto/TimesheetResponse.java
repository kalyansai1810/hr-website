package com.example.hrwebsite.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

/**
 * DTO for timesheet responses
 */
public class TimesheetResponse {
    
    private Long id;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    
    private Integer hours;
    private String project;
    private String notes;
    private String status;
    private UserResponse user;
    
    // Constructors
    public TimesheetResponse() {}
    
    public TimesheetResponse(Long id, LocalDate date, Integer hours, String project, 
                           String notes, String status, UserResponse user) {
        this.id = id;
        this.date = date;
        this.hours = hours;
        this.project = project;
        this.notes = notes;
        this.status = status;
        this.user = user;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public Integer getHours() {
        return hours;
    }
    
    public void setHours(Integer hours) {
        this.hours = hours;
    }
    
    public String getProject() {
        return project;
    }
    
    public void setProject(String project) {
        this.project = project;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public UserResponse getUser() {
        return user;
    }
    
    public void setUser(UserResponse user) {
        this.user = user;
    }
}