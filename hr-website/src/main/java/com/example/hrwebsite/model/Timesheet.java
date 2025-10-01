package com.example.hrwebsite.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Timesheet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    
    @NotBlank(message = "Project name cannot be blank")
    private String project;
    
    @Min(value = 1, message = "Hours must be at least 1")
    private int hours;
    
    private String notes;
    private LocalDate date;
    private String status; // PENDING, APPROVED, REJECTED
}
