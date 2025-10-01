package com.example.hrwebsite.controller;

import com.example.hrwebsite.dto.ApiResponse;
import com.example.hrwebsite.dto.LoginRequest;
import com.example.hrwebsite.dto.UserRegistrationRequest;
import com.example.hrwebsite.model.User;
import com.example.hrwebsite.service.AuthService;
import com.example.hrwebsite.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for authentication operations
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserService userService;
    
    /**
     * User login endpoint
     * @param loginRequest Login credentials
     * @return JWT token and user details
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for email: {}", loginRequest.getEmail());
        
        Map<String, Object> response = authService.login(loginRequest.getEmail(), loginRequest.getPassword());
        
        logger.info("Login successful for email: {}", loginRequest.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
    
    /**
     * User registration endpoint
     * @param registrationRequest User registration data
     * @return Registration confirmation and user details
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody UserRegistrationRequest registrationRequest) {
        logger.info("Registration attempt for email: {}", registrationRequest.getEmail());
        
        // Convert DTO to Entity
        User user = new User();
        user.setName(registrationRequest.getName());
        user.setEmail(registrationRequest.getEmail());
        user.setPassword(registrationRequest.getPassword());
        user.setRole(registrationRequest.getRole());
        user.setEmployeeId(registrationRequest.getEmployeeId());
        user.setDepartment(registrationRequest.getDepartment());
        user.setJobTitle(registrationRequest.getJobTitle());
        user.setActive(registrationRequest.getActive());
        
        // Set manager if provided
        if (registrationRequest.getManagerId() != null) {
            User manager = userService.findById(registrationRequest.getManagerId())
                .orElseThrow(() -> new RuntimeException("Manager not found with ID: " + registrationRequest.getManagerId()));
            user.setManager(manager);
        }
        
        Map<String, Object> response = authService.register(user);
        
        logger.info("Registration successful for email: {}", registrationRequest.getEmail());
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }
    
    /**
     * Get current user details
     * @return Current authenticated user information
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser() {
        User currentUser = authService.getCurrentUser();
        logger.info("Current user details requested: {}", currentUser.getEmail());
        
        return ResponseEntity.ok(ApiResponse.success("Current user details", currentUser));
    }
}
