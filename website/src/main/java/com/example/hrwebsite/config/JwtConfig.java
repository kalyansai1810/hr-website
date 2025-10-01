package com.example.hrwebsite.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for JWT
 */
@Configuration
@ConfigurationProperties(prefix = "app.jwt")
public class JwtConfig {
    
    private String secret;
    private long expirationMs;
    
    // Getters and Setters
    public String getSecret() {
        return secret;
    }
    
    public void setSecret(String secret) {
        this.secret = secret;
    }
    
    public long getExpirationMs() {
        return expirationMs;
    }
    
    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }
}