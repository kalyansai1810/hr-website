package com.example.hrwebsite.service;

import com.example.hrwebsite.exception.BadRequestException;
import com.example.hrwebsite.exception.ResourceNotFoundException;
import com.example.hrwebsite.model.User;
import com.example.hrwebsite.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Optional;

@Service
@Validated
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Get all users in the system
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Get all active users
     */
    @Transactional(readOnly = true)
    public List<User> getAllActiveUsers() {
        return userRepository.findByActive(true);
    }
    
    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(String role) {
        return userRepository.findByRoleAndActive(role, true);
    }
    
    /**
     * Get all active employees
     */
    @Transactional(readOnly = true)
    public List<User> getAllActiveEmployees() {
        return userRepository.findAllActiveEmployees();
    }
    
    /**
     * Get all active managers
     */
    @Transactional(readOnly = true)
    public List<User> getAllActiveManagers() {
        return userRepository.findAllActiveManagers();
    }
    
    /**
     * Get all active HR users
     */
    @Transactional(readOnly = true)
    public List<User> getAllActiveHR() {
        return userRepository.findAllActiveHR();
    }
    
    /**
     * Find user by email
     */
    @Transactional(readOnly = true)
    public User findByEmail(@NotBlank @Email String email) {
        return userRepository.findByEmailWithManager(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
    
    /**
     * Find user by ID
     */
    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findByIdWithManager(id);
    }
    
    /**
     * Get user by ID (throws exception if not found)
     */
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findByIdWithManager(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    
    /**
     * Find user by employee ID
     */
    @Transactional(readOnly = true)
    public User findByEmployeeId(String employeeId) {
        return userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with employee ID: " + employeeId));
    }
    
    /**
     * Get employees managed by a manager
     */
    @Transactional(readOnly = true)
    public List<User> getEmployeesByManager(Long managerId) {
        return userRepository.findActiveEmployeesByManager(managerId);
    }
    
    /**
     * Get users by department
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByDepartment(String department) {
        return userRepository.findByDepartment(department);
    }
    
    /**
     * Search users
     */
    @Transactional(readOnly = true)
    public List<User> searchUsers(String searchTerm) {
        return userRepository.searchUsers(searchTerm);
    }
    
    /**
     * Get all departments
     */
    @Transactional(readOnly = true)
    public List<String> getAllDepartments() {
        return userRepository.findAllDepartments();
    }
    
    /**
     * Create a new user
     */
    public User createUser(@Valid User user, Long createdById) {
        log.info("Creating new user with email: {} by user: {}", user.getEmail(), createdById);
        
        // Check if user already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new BadRequestException("User already exists with email: " + user.getEmail());
        }
        
        // Check if employee ID already exists (if provided)
        if (user.getEmployeeId() != null && !user.getEmployeeId().isEmpty()) {
            if (userRepository.findByEmployeeId(user.getEmployeeId()).isPresent()) {
                throw new BadRequestException("User already exists with employee ID: " + user.getEmployeeId());
            }
        }
        
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set default active status
        if (user.getActive() == null) {
            user.setActive(true);
        }
        
        // Validate manager assignment
        if (user.getManager() != null) {
            User manager = getUserById(user.getManager().getId());
            if (!manager.isManager()) {
                throw new BadRequestException("Assigned manager must have MANAGER role");
            }
            user.setManager(manager);
        }
        
        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        return savedUser;
    }
    
    /**
     * Update user information
     */
    public User updateUser(Long id, User updatedUser, Long updatedById) {
        log.info("Updating user: {} by user: {}", id, updatedById);
        
        User existingUser = getUserById(id);
        
        // Check if email is being changed and if it conflicts
        if (!existingUser.getEmail().equals(updatedUser.getEmail())) {
            if (userRepository.findByEmail(updatedUser.getEmail()).isPresent()) {
                throw new BadRequestException("User already exists with email: " + updatedUser.getEmail());
            }
        }
        
        // Check if employee ID is being changed and if it conflicts
        if (updatedUser.getEmployeeId() != null && 
            !updatedUser.getEmployeeId().equals(existingUser.getEmployeeId())) {
            if (userRepository.findByEmployeeId(updatedUser.getEmployeeId()).isPresent()) {
                throw new BadRequestException("User already exists with employee ID: " + updatedUser.getEmployeeId());
            }
        }
        
        // Update fields
        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setRole(updatedUser.getRole());
        existingUser.setEmployeeId(updatedUser.getEmployeeId());
        existingUser.setDepartment(updatedUser.getDepartment());
        existingUser.setJobTitle(updatedUser.getJobTitle());
        
        // Update password if provided
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        
        // Update manager assignment
        if (updatedUser.getManager() != null) {
            User manager = getUserById(updatedUser.getManager().getId());
            if (!manager.isManager()) {
                throw new BadRequestException("Assigned manager must have MANAGER role");
            }
            existingUser.setManager(manager);
        } else {
            existingUser.setManager(null);
        }
        
        // Update active status
        if (updatedUser.getActive() != null) {
            existingUser.setActive(updatedUser.getActive());
        }
        
        User savedUser = userRepository.save(existingUser);
        log.info("User updated successfully: {}", savedUser.getId());
        return savedUser;
    }
    
    /**
     * Deactivate user (soft delete)
     */
    public void deactivateUser(Long id, Long deactivatedById) {
        log.info("Deactivating user: {} by user: {}", id, deactivatedById);
        
        User user = getUserById(id);
        user.setActive(false);
        userRepository.save(user);
        
        log.info("User deactivated successfully: {}", id);
    }
    
    /**
     * Activate user
     */
    public void activateUser(Long id, Long activatedById) {
        log.info("Activating user: {} by user: {}", id, activatedById);
        
        User user = getUserById(id);
        user.setActive(true);
        userRepository.save(user);
        
        log.info("User activated successfully: {}", id);
    }
    
    /**
     * Delete user by ID (hard delete)
     */
    public void deleteUser(Long id, Long deletedById) {
        log.info("Deleting user: {} by user: {}", id, deletedById);
        
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with ID: " + id);
        }
        
        // TODO: Check if user has associated data (timesheets, projects, etc.)
        // For now, we'll just delete
        
        userRepository.deleteById(id);
        log.info("User deleted successfully: {}", id);
    }
    
    /**
     * Check if email already exists
     */
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
    
    /**
     * Check if employee ID already exists
     */
    @Transactional(readOnly = true)
    public boolean employeeIdExists(String employeeId) {
        return userRepository.findByEmployeeId(employeeId).isPresent();
    }
    
    /**
     * Assign manager to employee
     */
    public void assignManager(Long employeeId, Long managerId, Long assignedById) {
        log.info("Assigning manager {} to employee {} by user: {}", managerId, employeeId, assignedById);
        
        User employee = getUserById(employeeId);
        User manager = getUserById(managerId);
        
        if (!manager.isManager()) {
            throw new BadRequestException("Assigned user must have MANAGER role");
        }
        
        if (!employee.isEmployee()) {
            throw new BadRequestException("Target user must have EMPLOYEE role");
        }
        
        employee.setManager(manager);
        userRepository.save(employee);
        
        log.info("Manager assigned successfully");
    }
    
    /**
     * Get user statistics
     */
    @Transactional(readOnly = true)
    public UserStats getUserStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findByActive(true).size();
        long adminUsers = userRepository.countActiveUsersByRole("ADMIN");
        long hrUsers = userRepository.countActiveUsersByRole("HR");
        long managerUsers = userRepository.countActiveUsersByRole("MANAGER");
        long employeeUsers = userRepository.countActiveUsersByRole("EMPLOYEE");
        
        return new UserStats(totalUsers, activeUsers, adminUsers, hrUsers, managerUsers, employeeUsers);
    }
    
    /**
     * User statistics inner class
     */
    public static class UserStats {
        private final long totalUsers;
        private final long activeUsers;
        private final long adminUsers;
        private final long hrUsers;
        private final long managerUsers;
        private final long employeeUsers;
        
        public UserStats(long totalUsers, long activeUsers, long adminUsers, long hrUsers, long managerUsers, long employeeUsers) {
            this.totalUsers = totalUsers;
            this.activeUsers = activeUsers;
            this.adminUsers = adminUsers;
            this.hrUsers = hrUsers;
            this.managerUsers = managerUsers;
            this.employeeUsers = employeeUsers;
        }
        
        // Getters
        public long getTotalUsers() { return totalUsers; }
        public long getActiveUsers() { return activeUsers; }
        public long getInactiveUsers() { return totalUsers - activeUsers; }
        public long getAdminUsers() { return adminUsers; }
        public long getHrUsers() { return hrUsers; }
        public long getManagerUsers() { return managerUsers; }
        public long getEmployeeUsers() { return employeeUsers; }
    }
}