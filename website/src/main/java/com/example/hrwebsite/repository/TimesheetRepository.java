package com.example.hrwebsite.repository;

import com.example.hrwebsite.model.Project;
import com.example.hrwebsite.model.Timesheet;
import com.example.hrwebsite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
    
    List<Timesheet> findByUser(User user);
    
    List<Timesheet> findByUserId(Long userId);
    
    List<Timesheet> findByStatus(String status);
    
    List<Timesheet> findByProject(Project project);
    
    List<Timesheet> findByUserAndProject(User user, Project project);
    
    List<Timesheet> findByUserAndStatus(User user, String status);
    
    List<Timesheet> findByProjectAndStatus(Project project, String status);
    
    // JOIN FETCH methods to avoid lazy loading issues
    @Query("SELECT t FROM Timesheet t " +
           "LEFT JOIN FETCH t.user u " +
           "LEFT JOIN FETCH u.manager " +
           "LEFT JOIN FETCH t.project p " +
           "LEFT JOIN FETCH p.projectManager " +
           "LEFT JOIN FETCH p.createdBy " +
           "LEFT JOIN FETCH t.reviewedBy " +
           "WHERE t.id = :id")
    Optional<Timesheet> findByIdWithRelations(@Param("id") Long id);
    
    @Query("SELECT t FROM Timesheet t " +
           "LEFT JOIN FETCH t.user u " +
           "LEFT JOIN FETCH u.manager " +
           "LEFT JOIN FETCH t.project p " +
           "LEFT JOIN FETCH p.projectManager " +
           "LEFT JOIN FETCH p.createdBy " +
           "LEFT JOIN FETCH t.reviewedBy " +
           "WHERE t.user.id = :userId")
    List<Timesheet> findByUserIdWithRelations(@Param("userId") Long userId);
    
    @Query("SELECT t FROM Timesheet t " +
           "LEFT JOIN FETCH t.user u " +
           "LEFT JOIN FETCH u.manager " +
           "LEFT JOIN FETCH t.project p " +
           "LEFT JOIN FETCH p.projectManager " +
           "LEFT JOIN FETCH p.createdBy " +
           "LEFT JOIN FETCH t.reviewedBy")
    List<Timesheet> findAllWithRelations();
    
    Optional<Timesheet> findByUserAndProjectAndDate(User user, Project project, LocalDate date);
    
    List<Timesheet> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);
    
    List<Timesheet> findByProjectAndDateBetween(Project project, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT t FROM Timesheet t WHERE t.user.manager.id = :managerId")
    List<Timesheet> findTimesheetsByManager(@Param("managerId") Long managerId);
    
    @Query("SELECT t FROM Timesheet t WHERE t.user.manager.id = :managerId AND t.status = :status")
    List<Timesheet> findTimesheetsByManagerAndStatus(@Param("managerId") Long managerId, @Param("status") String status);
    
    @Query("SELECT t FROM Timesheet t WHERE t.project.projectManager.id = :projectManagerId")
    List<Timesheet> findTimesheetsByProjectManager(@Param("projectManagerId") Long projectManagerId);
    
    @Query("SELECT t FROM Timesheet t WHERE t.project.projectManager.id = :projectManagerId AND t.status = :status")
    List<Timesheet> findTimesheetsByProjectManagerAndStatus(@Param("projectManagerId") Long projectManagerId, @Param("status") String status);
    
    @Query("SELECT t FROM Timesheet t WHERE t.reviewedBy.id = :reviewerId")
    List<Timesheet> findTimesheetsReviewedBy(@Param("reviewerId") Long reviewerId);
    
    @Query("SELECT t FROM Timesheet t WHERE t.date BETWEEN :startDate AND :endDate")
    List<Timesheet> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT t FROM Timesheet t WHERE t.date BETWEEN :startDate AND :endDate AND t.status = :status")
    List<Timesheet> findByDateRangeAndStatus(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, @Param("status") String status);
    
    @Query("SELECT SUM(t.hours) FROM Timesheet t WHERE t.user.id = :userId AND t.status = 'APPROVED' AND t.date BETWEEN :startDate AND :endDate")
    Double sumApprovedHoursByUserAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(t.hours) FROM Timesheet t WHERE t.project.id = :projectId AND t.status = 'APPROVED' AND t.date BETWEEN :startDate AND :endDate")
    Double sumApprovedHoursByProjectAndDateRange(@Param("projectId") Long projectId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(t) FROM Timesheet t WHERE t.status = :status")
    Long countByStatus(@Param("status") String status);
    
    @Query("SELECT COUNT(t) FROM Timesheet t WHERE t.user.manager.id = :managerId AND t.status = 'PENDING'")
    Long countPendingTimesheetsByManager(@Param("managerId") Long managerId);
    
    @Query("SELECT t FROM Timesheet t WHERE t.user.id IN :employeeIds AND t.status = :status")
    List<Timesheet> findByEmployeeIdsAndStatus(@Param("employeeIds") List<Long> employeeIds, @Param("status") String status);
}
