package com.example.hrwebsite.service;

import com.example.hrwebsite.model.User;
import com.example.hrwebsite.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    /**
     * Register a new user
     * @param user User to register
     * @return Registration response with user details
     */
    public Map<String, Object> register(User user) {
        // Validate user data
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        
        if (user.getName() == null || user.getName().isEmpty()) {
            throw new RuntimeException("Name is required");
        }
        
        // Set default role if not provided
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("EMPLOYEE");
        }
        
        // Create user (using null for createdById since this is self-registration)
        User createdUser = userService.createUser(user, null);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("user", Map.of(
            "id", createdUser.getId(),
            "name", createdUser.getName(),
            "email", createdUser.getEmail(),
            "role", createdUser.getRole()
        ));
        
        return response;
    }
    
    /**
     * Authenticate user and generate JWT token
     * @param email User email
     * @param password User password
     * @return Authentication response with JWT token
     */
    public Map<String, Object> login(String email, String password) {
        // Validate input
        if (email == null || email.isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        
        if (password == null || password.isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Get user details
        User user = userService.findByEmail(email);
        
        // Generate JWT token
        String jwt = tokenProvider.generateToken(authentication);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("type", "Bearer");
        response.put("user", Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole()
        ));
        
        return response;
    }
    
    /**
     * Get current authenticated user
     * @return Current user details
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }
        
        String email = authentication.getName();
        return userService.findByEmail(email);
    }
    
    /**
     * Check if current user has specific role
     * @param role Role to check
     * @return true if user has the role, false otherwise
     */
    public boolean hasRole(String role) {
        try {
            User currentUser = getCurrentUser();
            return role.equals(currentUser.getRole());
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Check if current user is a manager
     * @return true if user is a manager, false otherwise
     */
    public boolean isManager() {
        return hasRole("MANAGER");
    }
    
    /**
     * Check if current user is an employee
     * @return true if user is an employee, false otherwise
     */
    public boolean isEmployee() {
        return hasRole("EMPLOYEE");
    }
}