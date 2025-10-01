package com.example.hrwebsite.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator implementation for the ValidRole annotation
 */
public class ValidRoleValidator implements ConstraintValidator<ValidRole, String> {
    
    private static final String[] VALID_ROLES = {"ADMIN", "HR", "MANAGER", "EMPLOYEE"};
    
    @Override
    public void initialize(ValidRole constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(String role, ConstraintValidatorContext context) {
        if (role == null) {
            return false;
        }
        
        for (String validRole : VALID_ROLES) {
            if (validRole.equals(role.toUpperCase())) {
                return true;
            }
        }
        
        return false;
    }
}