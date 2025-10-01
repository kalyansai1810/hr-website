package com.example.hrwebsite.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Aspect for logging method execution times and performance monitoring
 */
@Aspect
@Component
public class LoggingAspect {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);
    
    /**
     * Log execution time for all service methods
     */
    @Around("execution(* com.example.hrwebsite.service.*.*(..))")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return logExecutionTime(joinPoint, "SERVICE");
    }
    
    /**
     * Log execution time for all controller methods
     */
    @Around("execution(* com.example.hrwebsite.controller.*.*(..))")
    public Object logControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return logExecutionTime(joinPoint, "CONTROLLER");
    }
    
    /**
     * Log execution time for repository methods
     */
    @Around("execution(* com.example.hrwebsite.repository.*.*(..))")
    public Object logRepositoryMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        return logExecutionTime(joinPoint, "REPOSITORY");
    }
    
    /**
     * Generic method to log execution time
     */
    private Object logExecutionTime(ProceedingJoinPoint joinPoint, String layer) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        logger.debug("[{}] Executing {}.{}() with args: {}", 
                    layer, className, methodName, Arrays.toString(args));
        
        try {
            Object result = joinPoint.proceed();
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            
            logger.info("[{}] {}.{}() executed successfully in {} ms", 
                       layer, className, methodName, executionTime);
            
            // Log slow operations (> 1000ms)
            if (executionTime > 1000) {
                logger.warn("[{}] SLOW OPERATION DETECTED: {}.{}() took {} ms", 
                           layer, className, methodName, executionTime);
            }
            
            return result;
            
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            
            logger.error("[{}] {}.{}() failed after {} ms with error: {}", 
                        layer, className, methodName, executionTime, e.getMessage(), e);
            throw e;
        }
    }
}