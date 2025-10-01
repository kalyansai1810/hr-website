package com.example.hrwebsite;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Data initializer for enterprise HR system
 * In production, users and projects should be created through API endpoints, not pre-initialized
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Override
    public void run(String... args) throws Exception {
        logger.info("HR Website Application started successfully!");
        logger.info("4-Role Enterprise System initialized:");
        logger.info("- ADMIN: Can create and manage all users");
        logger.info("- HR: Can create projects and assign employees");
        logger.info("- MANAGER: Can approve/reject timesheets from assigned employees");
        logger.info("- EMPLOYEE: Can submit timesheets for assigned projects");
        logger.info("");
        logger.info("To get started:");
        logger.info("1. Register an ADMIN user via POST /api/auth/register");
        logger.info("2. Admin can create HR, Manager, and Employee users via POST /api/admin/users");
        logger.info("3. HR can create projects via POST /api/hr/projects");
        logger.info("4. HR can assign employees to projects via POST /api/hr/assignments");
        logger.info("5. Employees can submit timesheets via POST /api/timesheets");
        logger.info("6. Managers can approve/reject timesheets via PUT /api/manager/timesheets/{id}/approve");
        logger.info("");
        logger.info("Database schema is ready for enterprise operations!");
        logger.info("Data initialization completed successfully.");
    }
}
