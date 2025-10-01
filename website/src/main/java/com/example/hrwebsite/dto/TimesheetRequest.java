package com.example.hrwebsite.dto;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO for timesheet creation and update requests
 */
@Data
public class TimesheetRequest {
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
    
    @NotNull(message = "Date is required")
    @PastOrPresent(message = "Date cannot be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    
    @NotNull(message = "Hours worked is required")
    @DecimalMin(value = "0.5", message = "Hours worked must be at least 0.5")
    @DecimalMax(value = "24.0", message = "Hours worked cannot exceed 24 per day")
    private Double hours;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}