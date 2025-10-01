package com.example.hrwebsite;

import com.example.hrwebsite.model.User;
import com.example.hrwebsite.model.Timesheet;
import com.example.hrwebsite.repository.UserRepository;
import com.example.hrwebsite.repository.TimesheetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Data initializer for setting up default users and sample data
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TimesheetRepository timesheetRepository;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Starting data initialization...");
        
        // Skip user creation - users will be created manually through registration
        // initializeDefaultUsers();
        
        // Only create sample timesheets if users exist and no timesheets exist
        if (userRepository.count() > 0) {
            initializeSampleTimesheets();
        } else {
            logger.info("No users found - skipping timesheet initialization");
        }
        
        logger.info("Data initialization completed successfully");
    }
    
    /**
     * Initialize sample timesheets for testing (only if users exist)
     */
    private void initializeSampleTimesheets() {
        // Only create sample data if no timesheets exist
        if (timesheetRepository.count() == 0) {
            User employee = userRepository.findByEmail("employee@hrwebsite.com").orElse(null);
            User alice = userRepository.findByEmail("alice@hrwebsite.com").orElse(null);
            
            if (employee != null) {
                createSampleTimesheet(employee, "Project Alpha", 8, "Working on user authentication", LocalDate.now().minusDays(2), "APPROVED");
                createSampleTimesheet(employee, "Project Beta", 6, "Bug fixes and testing", LocalDate.now().minusDays(1), "PENDING");
                createSampleTimesheet(employee, "Project Alpha", 7, "Database optimization", LocalDate.now(), "PENDING");
            }
            
            if (alice != null) {
                createSampleTimesheet(alice, "Project Gamma", 8, "Frontend development", LocalDate.now().minusDays(3), "APPROVED");
                createSampleTimesheet(alice, "Project Delta", 5, "Code review and documentation", LocalDate.now().minusDays(1), "REJECTED");
                createSampleTimesheet(alice, "Project Gamma", 8, "UI improvements", LocalDate.now(), "PENDING");
            }
            
            logger.info("Created sample timesheet data for testing");
        }
    }
    
    /**
     * Helper method to create a sample timesheet
     */
    private void createSampleTimesheet(User user, String project, int hours, String notes, LocalDate date, String status) {
        Timesheet timesheet = new Timesheet();
        timesheet.setUser(user);
        timesheet.setProject(project);
        timesheet.setHours(hours);
        timesheet.setNotes(notes);
        timesheet.setDate(date);
        timesheet.setStatus(status);
        timesheetRepository.save(timesheet);
    }
}
