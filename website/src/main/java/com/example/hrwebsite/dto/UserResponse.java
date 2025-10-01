package com.example.hrwebsite.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for user responses (excludes sensitive data like password)
 */
@Data
public class UserResponse {
    
    private Long id;
    private String name;
    private String email;
    private String role;
    private String employeeId;
    private String department;
    private String jobTitle;
    private Boolean active;
    
    // Manager information
    private Long managerId;
    private String managerName;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}