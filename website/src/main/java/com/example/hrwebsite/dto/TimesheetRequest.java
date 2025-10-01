package com.example.hrwebsite.dto;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

/**
 * DTO for timesheet creation and update requests
 */
public class TimesheetRequest {
    
    @NotNull(message = "Date is required")
    @PastOrPresent(message = "Date cannot be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    
    @NotNull(message = "Hours worked is required")
    @Min(value = 1, message = "Hours worked must be at least 1")
    @Max(value = 24, message = "Hours worked cannot exceed 24 per day")
    private Integer hours;
    
    @NotBlank(message = "Project name is required")
    @Size(min = 2, max = 255, message = "Project name must be between 2 and 255 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-_\\.]+$", message = "Project name contains invalid characters")
    private String project;
    
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
    
    // Constructors
    public TimesheetRequest() {}
    
    public TimesheetRequest(LocalDate date, Integer hours, String project, String notes) {
        this.date = date;
        this.hours = hours;
        this.project = project;
        this.notes = notes;
    }
    
    // Getters and Setters
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
    
    @Override
    public String toString() {
        return "TimesheetRequest{" +
                "date=" + date +
                ", hours=" + hours +
                ", project='" + project + '\'' +
                ", notes='" + notes + '\'' +
                '}';
    }
}