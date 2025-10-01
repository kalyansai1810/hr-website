-- HR Website Database Setup Script
-- PostgreSQL Database initialization for Enhanced 4-Role System

-- Create database (run this as postgres superuser)
-- CREATE DATABASE hrdb;
-- CREATE USER hruser WITH ENCRYPTED PASSWORD 'hrpassword123';
-- GRANT ALL PRIVILEGES ON DATABASE hrdb TO hruser;

-- Use this database
\c hrdb;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO hruser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hruser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hruser;

-- Drop existing tables if they exist (for fresh setup)
DROP VIEW IF EXISTS timesheet_report;
DROP TABLE IF EXISTS employee_project_assignments CASCADE;
DROP TABLE IF EXISTS timesheet CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table with enhanced 4-role system
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')),
    employee_id VARCHAR(20) UNIQUE,
    department VARCHAR(100),
    job_title VARCHAR(100),
    manager_id INTEGER REFERENCES users(id),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    client VARCHAR(255),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED')),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    budget DECIMAL(15,2),
    project_manager_id INTEGER REFERENCES users(id),
    created_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Employee Project Assignments table
CREATE TABLE employee_project_assignments (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL DEFAULT 'Developer',
    start_date DATE,
    end_date DATE,
    allocated_hours DECIMAL(5,2),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'COMPLETED')),
    assigned_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, project_id)
);

-- Create enhanced Timesheets table
CREATE TABLE timesheet (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id),
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    hours DECIMAL(4,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by_id INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_department ON users(department);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager ON projects(project_manager_id);
CREATE INDEX idx_projects_created_by ON projects(created_by_id);

CREATE INDEX idx_assignments_employee ON employee_project_assignments(employee_id);
CREATE INDEX idx_assignments_project ON employee_project_assignments(project_id);
CREATE INDEX idx_assignments_status ON employee_project_assignments(status);

CREATE INDEX idx_timesheet_user_id ON timesheet(user_id);
CREATE INDEX idx_timesheet_project_id ON timesheet(project_id);
CREATE INDEX idx_timesheet_status ON timesheet(status);
CREATE INDEX idx_timesheet_date ON timesheet(date);
CREATE INDEX idx_timesheet_reviewed_by ON timesheet(reviewed_by_id);

-- Create triggers for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON employee_project_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timesheet_updated_at
    BEFORE UPDATE ON timesheet
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create comprehensive views for reporting
CREATE OR REPLACE VIEW timesheet_report AS
SELECT 
    t.id,
    u.name as employee_name,
    u.email as employee_email,
    u.employee_id,
    u.department,
    p.name as project_name,
    p.code as project_code,
    t.date,
    t.start_time,
    t.end_time,
    t.hours,
    t.notes,
    t.status,
    reviewer.name as reviewed_by,
    t.reviewed_at,
    t.created_at,
    t.updated_at
FROM timesheet t
JOIN users u ON t.user_id = u.id
LEFT JOIN projects p ON t.project_id = p.id
LEFT JOIN users reviewer ON t.reviewed_by_id = reviewer.id
ORDER BY t.date DESC, t.created_at DESC;

CREATE OR REPLACE VIEW project_assignments_report AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.code as project_code,
    p.status as project_status,
    u.id as employee_id,
    u.name as employee_name,
    u.email as employee_email,
    u.department,
    epa.role as assignment_role,
    epa.start_date,
    epa.end_date,
    epa.allocated_hours,
    epa.status as assignment_status,
    manager.name as project_manager,
    assignor.name as assigned_by
FROM projects p
JOIN employee_project_assignments epa ON p.id = epa.project_id
JOIN users u ON epa.employee_id = u.id
LEFT JOIN users manager ON p.project_manager_id = manager.id
LEFT JOIN users assignor ON epa.assigned_by_id = assignor.id
ORDER BY p.name, u.name;

CREATE OR REPLACE VIEW user_hierarchy_report AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.employee_id,
    u.department,
    u.job_title,
    u.active,
    m.name as manager_name,
    m.email as manager_email,
    (SELECT COUNT(*) FROM users subordinates WHERE subordinates.manager_id = u.id) as direct_reports
FROM users u
LEFT JOIN users m ON u.manager_id = m.id
ORDER BY u.department, u.name;

-- Grant permissions on views
GRANT SELECT ON timesheet_report TO hruser;
GRANT SELECT ON project_assignments_report TO hruser;
GRANT SELECT ON user_hierarchy_report TO hruser;

-- Insert sample data for 4-role system
-- Admin user (password: admin123)
INSERT INTO users (name, email, password, role, employee_id, department, job_title, active) VALUES 
('System Admin', 'admin@company.com', '$2a$10$7KUbDnQiKp1wP/ydGOTxGOUj9MYJ7QWYzPyGwKBQVp9UfqEKJ4LIa', 'ADMIN', 'ADMIN001', 'IT', 'System Administrator', true);

-- HR users (password: hr123)
INSERT INTO users (name, email, password, role, employee_id, department, job_title, active) VALUES 
('Sarah HR Manager', 'sarah.hr@company.com', '$2a$10$7KUbDnQiKp1wP/ydGOTxGOUj9MYJ7QWYzPyGwKBQVp9UfqEKJ4LIa', 'HR', 'HR001', 'Human Resources', 'HR Manager', true),
('Mike HR Specialist', 'mike.hr@company.com', '$2a$10$7KUbDnQiKp1wP/ydGOTxGOUj9MYJ7QWYzPyGwKBQVp9UfqEKJ4LIa', 'HR', 'HR002', 'Human Resources', 'HR Specialist', true);

-- Manager users (password: manager123)
INSERT INTO users (name, email, password, role, employee_id, department, job_title, active) VALUES 
('John Manager', 'john.manager@company.com', '$2a$10$7KUbDnQiKp1wP/ydGOTxGOUj9MYJ7QWYzPyGwKBQVp9UfqEKJ4LIa', 'MANAGER', 'MGR001', 'Engineering', 'Engineering Manager', true),
('Lisa Project Manager', 'lisa.pm@company.com', '$2a$10$7KUbDnQiKp1wP/ydGOTxGOUj9MYJ7QWYzPyGwKBQVp9UfqEKJ4LIa', 'MANAGER', 'MGR002', 'Engineering', 'Project Manager', true);

-- Employee users (password: employee123)
INSERT INTO users (name, email, password, role, employee_id, department, job_title, manager_id, active) VALUES 
('Alice Developer', 'alice.dev@company.com', '$2a$10$7KUbDnQiKp1wP/ydGOTxGOUj9MYJ7QWYzPyGwKBQVp9UfqEKJ4LIa', 'EMPLOYEE', 'EMP001', 'Engineering', 'Senior Developer', 4, true),
('Bob Developer', 'bob.dev@company.com', '$2a$10$7KUbDnQiKp1wP/ydGOTxGOUj9MYJ7QWYzPyGwKBQVp9UfqEKJ4LIa', 'EMPLOYEE', 'EMP002', 'Engineering', 'Junior Developer', 4, true),
('Carol Designer', 'carol.design@company.com', '$2a$10$7KUbDnQiKp1wP/ydGOTxGOUj9MYJ7QWYzPyGwKBQVp9UfqEKJ4LIa', 'EMPLOYEE', 'EMP003', 'Design', 'UX Designer', 5, true),
('David QA', 'david.qa@company.com', '$2a$10$7KUbDnQiKp1wP/ydGOTxGOUj9MYJ7QWYzPyGwKBQVp9UfqEKJ4LIa', 'EMPLOYEE', 'EMP004', 'Quality Assurance', 'QA Engineer', 4, true);

-- Sample projects
INSERT INTO projects (name, code, description, client, start_date, end_date, status, priority, budget, project_manager_id, created_by_id) VALUES 
('E-Commerce Platform', 'ECOM-2024', 'Modern e-commerce platform with React and Spring Boot', 'TechCorp Inc', '2024-01-01', '2024-06-30', 'ACTIVE', 'HIGH', 150000.00, 4, 2),
('Mobile App Development', 'MOBILE-2024', 'Cross-platform mobile application using React Native', 'StartupXYZ', '2024-02-01', '2024-08-31', 'ACTIVE', 'MEDIUM', 80000.00, 5, 2),
('Data Analytics Dashboard', 'ANALYTICS-2024', 'Business intelligence dashboard with real-time analytics', 'DataCorp', '2024-03-01', '2024-09-30', 'ACTIVE', 'HIGH', 120000.00, 4, 2);

-- Sample employee project assignments
INSERT INTO employee_project_assignments (employee_id, project_id, role, start_date, allocated_hours, status, assigned_by_id) VALUES 
(6, 1, 'Senior Developer', '2024-01-01', 40.00, 'ACTIVE', 2), -- Alice on E-Commerce
(7, 1, 'Junior Developer', '2024-01-15', 35.00, 'ACTIVE', 2), -- Bob on E-Commerce
(8, 2, 'UX Designer', '2024-02-01', 30.00, 'ACTIVE', 2), -- Carol on Mobile App
(9, 1, 'QA Engineer', '2024-01-01', 25.00, 'ACTIVE', 2), -- David on E-Commerce
(6, 3, 'Tech Lead', '2024-03-01', 20.00, 'ACTIVE', 2), -- Alice on Analytics (part-time)
(7, 2, 'Mobile Developer', '2024-03-15', 20.00, 'ACTIVE', 2); -- Bob on Mobile App (part-time)

-- Sample timesheets
INSERT INTO timesheet (user_id, project_id, date, start_time, end_time, hours, notes, status) VALUES 
(6, 1, '2024-10-01', '09:00', '17:00', 8.0, 'Worked on user authentication module', 'APPROVED'),
(6, 1, '2024-09-30', '09:00', '17:00', 8.0, 'Code review and bug fixes', 'APPROVED'),
(7, 1, '2024-10-01', '09:00', '17:00', 8.0, 'Implemented shopping cart functionality', 'PENDING'),
(8, 2, '2024-10-01', '10:00', '18:00', 8.0, 'Created wireframes for mobile app', 'PENDING'),
(9, 1, '2024-10-01', '09:00', '17:00', 8.0, 'Automated testing for payment module', 'APPROVED');

-- Display data summary
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Projects' as table_name, COUNT(*) as record_count FROM projects
UNION ALL
SELECT 'Assignments' as table_name, COUNT(*) as record_count FROM employee_project_assignments
UNION ALL
SELECT 'Timesheets' as table_name, COUNT(*) as record_count FROM timesheet;

-- Show role distribution
SELECT role, COUNT(*) as user_count 
FROM users 
WHERE active = true 
GROUP BY role 
ORDER BY role;

-- Add table comments
COMMENT ON TABLE users IS 'Enhanced user table supporting 4-role system (ADMIN, HR, MANAGER, EMPLOYEE)';
COMMENT ON TABLE projects IS 'Project management table for tracking client projects and assignments';
COMMENT ON TABLE employee_project_assignments IS 'Many-to-many relationship between employees and projects';
COMMENT ON TABLE timesheet IS 'Enhanced timesheet entries with project tracking and time ranges';
COMMENT ON VIEW timesheet_report IS 'Comprehensive timesheet view with user and project details';
COMMENT ON VIEW project_assignments_report IS 'Detailed view of project assignments and roles';
COMMENT ON VIEW user_hierarchy_report IS 'User hierarchy view showing manager-employee relationships';