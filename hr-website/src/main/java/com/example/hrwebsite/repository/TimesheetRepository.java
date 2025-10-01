package com.example.hrwebsite.repository;

import com.example.hrwebsite.model.Timesheet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
    List<Timesheet> findByUserId(Long userId);
}
