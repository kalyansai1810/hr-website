package com.example.hrwebsite.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "timesheets")
@Data
@EqualsAndHashCode(exclude = {"user", "project", "reviewedBy"})
@ToString(exclude = {"user", "project", "reviewedBy"})
public class Timesheet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;
    
    // Reference to actual project entity instead of string
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @NotNull(message = "Project is required")
    @JsonIgnore
    private Project project;
    
    @NotNull(message = "Date is required")
    @PastOrPresent(message = "Date cannot be in the future")
    private LocalDate date;
    
    @NotNull(message = "Hours worked is required")
    @DecimalMin(value = "0.5", message = "Hours worked must be at least 0.5")
    @DecimalMax(value = "24.0", message = "Hours worked cannot exceed 24 per day")
    private Double hours;
    
    private LocalTime startTime;
    
    private LocalTime endTime;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(PENDING|APPROVED|REJECTED)$", message = "Status must be PENDING, APPROVED, or REJECTED")
    private String status; // PENDING, APPROVED, REJECTED
    
    // Who approved/rejected the timesheet
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    @JsonIgnore
    private User reviewedBy;
    
    private LocalDateTime reviewedAt;
    
    @Size(max = 500, message = "Review comments must not exceed 500 characters")
    private String reviewComments;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean isPending() {
        return "PENDING".equals(this.status);
    }
    
    public boolean isApproved() {
        return "APPROVED".equals(this.status);
    }
    
    public boolean isRejected() {
        return "REJECTED".equals(this.status);
    }
    
    public boolean canBeModified() {
        return isPending();
    }
}
