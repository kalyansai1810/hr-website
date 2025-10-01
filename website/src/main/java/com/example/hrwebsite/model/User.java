package com.example.hrwebsite.model;

import com.example.hrwebsite.validation.ValidRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(exclude = {"manager", "managedEmployees"})
@ToString(exclude = {"manager", "managedEmployees"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;
    
    @Column(unique = true)
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @JsonIgnore
    private String password;
    
    @NotBlank(message = "Role is required")
    @ValidRole
    private String role; // 'ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'
    
    @Size(max = 20, message = "Employee ID must not exceed 20 characters")
    private String employeeId;
    
    @Size(max = 100, message = "Department must not exceed 100 characters")
    private String department;
    
    @Size(max = 100, message = "Job title must not exceed 100 characters")
    private String jobTitle;
    
    // For employees: who is their manager
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @JsonIgnore
    private User manager;
    
    // For managers: list of employees they manage
    @OneToMany(mappedBy = "manager", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<User> managedEmployees;
    
    private Boolean active = true;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean isAdmin() {
        return "ADMIN".equals(this.role);
    }
    
    public boolean isHR() {
        return "HR".equals(this.role);
    }
    
    public boolean isManager() {
        return "MANAGER".equals(this.role);
    }
    
    public boolean isEmployee() {
        return "EMPLOYEE".equals(this.role);
    }
}
