package com.example.hrwebsite.repository;

import com.example.hrwebsite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByEmployeeId(String employeeId);
    
    List<User> findByRole(String role);
    
    List<User> findByActive(Boolean active);
    
    List<User> findByRoleAndActive(String role, Boolean active);
    
    List<User> findByManager(User manager);
    
    List<User> findByDepartment(String department);
    
    @Query("SELECT u FROM User u WHERE u.role = 'EMPLOYEE' AND u.active = true")
    List<User> findAllActiveEmployees();
    
    @Query("SELECT u FROM User u WHERE u.role = 'MANAGER' AND u.active = true")
    List<User> findAllActiveManagers();
    
    @Query("SELECT u FROM User u WHERE u.role = 'HR' AND u.active = true")
    List<User> findAllActiveHR();
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.manager WHERE u.manager.id = :managerId AND u.active = true")
    List<User> findActiveEmployeesByManager(@Param("managerId") Long managerId);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.manager WHERE u.email = :email")
    Optional<User> findByEmailWithManager(@Param("email") String email);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.manager WHERE u.id = :id")
    Optional<User> findByIdWithManager(@Param("id") Long id);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.active = true")
    Long countActiveUsersByRole(@Param("role") String role);
    
    @Query("SELECT u FROM User u WHERE u.role IN :roles AND u.active = true")
    List<User> findActiveUsersByRoles(@Param("roles") List<String> roles);
    
    @Query("SELECT u FROM User u WHERE u.name LIKE %:searchTerm% OR u.email LIKE %:searchTerm% OR u.employeeId LIKE %:searchTerm%")
    List<User> searchUsers(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT DISTINCT u.department FROM User u WHERE u.department IS NOT NULL AND u.active = true")
    List<String> findAllDepartments();
}
