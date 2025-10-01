package com.example.hrwebsite.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.validation.beanvalidation.MethodValidationPostProcessor;

/**
 * Configuration for validation
 */
@Configuration
public class ValidationConfig {
    
    /**
     * Validator factory bean for Bean Validation
     * @return LocalValidatorFactoryBean
     */
    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }
    
    /**
     * Method validation post processor for @Validated annotation support
     * @return MethodValidationPostProcessor
     */
    @Bean
    public MethodValidationPostProcessor methodValidationPostProcessor() {
        MethodValidationPostProcessor processor = new MethodValidationPostProcessor();
        processor.setValidator(validator());
        return processor;
    }
}