package com.example.hrwebsite.repository;

import com.example.hrwebsite.model.Timesheet;
import com.example.hrwebsite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
    List<Timesheet> findByUser(User user);
    List<Timesheet> findByUserId(Long userId);
    List<Timesheet> findByStatus(String status);
}
