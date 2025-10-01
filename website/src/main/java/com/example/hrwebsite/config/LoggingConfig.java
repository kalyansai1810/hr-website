package com.example.hrwebsite.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

/**
 * Configuration for logging
 */
@Configuration
public class LoggingConfig {
    
    /**
     * Configure request logging filter
     * @return CommonsRequestLoggingFilter
     */
    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter() {
        CommonsRequestLoggingFilter loggingFilter = new CommonsRequestLoggingFilter();
        loggingFilter.setIncludeClientInfo(true);
        loggingFilter.setIncludeQueryString(true);
        loggingFilter.setIncludePayload(false); // Don't log payload for security reasons
        loggingFilter.setIncludeHeaders(false); // Don't log headers for security reasons
        loggingFilter.setMaxPayloadLength(1000);
        loggingFilter.setAfterMessagePrefix("REQUEST DATA: ");
        return loggingFilter;
    }
}