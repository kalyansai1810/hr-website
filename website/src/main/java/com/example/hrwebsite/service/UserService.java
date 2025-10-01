package com.example.hrwebsite.service;

import com.example.hrwebsite.model.User;
import com.example.hrwebsite.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Optional;

@Service
@Validated
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Get all users in the system
     * @return List of all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Find user by email
     * @param email User email
     * @return User if found
     * @throws UsernameNotFoundException if user not found
     */
    public User findByEmail(@NotBlank @Email String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
    
    /**
     * Find user by ID
     * @param id User ID
     * @return User if found
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * Create a new user
     * @param user User to create
     * @return Created user
     */
    public User createUser(@Valid User user) {
        // Check if user already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }
        
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        return userRepository.save(user);
    }
    
    /**
     * Update user information
     * @param id User ID
     * @param updatedUser Updated user data
     * @return Updated user
     */
    public User updateUser(Long id, User updatedUser) {
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setRole(updatedUser.getRole());
        
        // Only update password if provided
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        
        return userRepository.save(existingUser);
    }
    
    /**
     * Delete user by ID
     * @param id User ID
     */
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
    
    /**
     * Check if email already exists
     * @param email Email to check
     * @return true if exists, false otherwise
     */
    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
}