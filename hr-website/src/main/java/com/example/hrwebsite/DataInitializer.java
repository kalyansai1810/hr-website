package com.example.hrwebsite;

import com.example.hrwebsite.model.User;
import com.example.hrwebsite.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByEmail("test@example.com").isEmpty()) {
            User testUser = new User();
            testUser.setName("Test User");
            testUser.setEmail("test@example.com");
            testUser.setPassword(passwordEncoder.encode("password"));
            testUser.setRole("Employee");
            userRepository.save(testUser);
        }

        if (userRepository.findByEmail("manager@example.com").isEmpty()) {
            User managerUser = new User();
            managerUser.setName("Manager User");
            managerUser.setEmail("manager@example.com");
            managerUser.setPassword(passwordEncoder.encode("password"));
            managerUser.setRole("Manager");
            userRepository.save(managerUser);
        }
    }
}
