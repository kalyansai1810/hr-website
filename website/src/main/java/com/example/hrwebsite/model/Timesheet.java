package com.example.hrwebsite.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Timesheet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;
    
    @NotBlank(message = "Project name is required")
    @Size(min = 2, max = 255, message = "Project name must be between 2 and 255 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-_\\.]+$", message = "Project name contains invalid characters")
    private String project;
    
    @NotNull(message = "Hours worked is required")
    @Min(value = 1, message = "Hours worked must be at least 1")
    @Max(value = 24, message = "Hours worked cannot exceed 24 per day")
    private int hours;
    
    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
    
    @NotNull(message = "Date is required")
    @PastOrPresent(message = "Date cannot be in the future")
    private LocalDate date;
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(PENDING|APPROVED|REJECTED)$", message = "Status must be PENDING, APPROVED, or REJECTED")
    private String status; // PENDING, APPROVED, REJECTED
}
