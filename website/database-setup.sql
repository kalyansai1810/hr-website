-- HR Website Database Setup Script
-- PostgreSQL Database initialization

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

-- Create Users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER'))
);

-- Create Timesheets table (if not exists)
CREATE TABLE IF NOT EXISTS timesheet (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project VARCHAR(255) NOT NULL,
    hours INTEGER NOT NULL CHECK (hours > 0 AND hours <= 24),
    notes TEXT,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_timesheet_user_id ON timesheet(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_status ON timesheet(status);
CREATE INDEX IF NOT EXISTS idx_timesheet_date ON timesheet(date);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to timesheet table
DROP TRIGGER IF EXISTS update_timesheet_updated_at ON timesheet;
CREATE TRIGGER update_timesheet_updated_at
    BEFORE UPDATE ON timesheet
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for timesheet reports
CREATE OR REPLACE VIEW timesheet_report AS
SELECT 
    t.id,
    u.name as employee_name,
    u.email as employee_email,
    t.project,
    t.hours,
    t.notes,
    t.date,
    t.status,
    t.created_at,
    t.updated_at
FROM timesheet t
JOIN users u ON t.user_id = u.id
ORDER BY t.date DESC, t.created_at DESC;

-- Grant permissions on the view
GRANT SELECT ON timesheet_report TO hruser;

-- Display current data summary
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Timesheets' as table_name, COUNT(*) as record_count FROM timesheet;

COMMENT ON TABLE users IS 'Application users with role-based access';
COMMENT ON TABLE timesheet IS 'Employee timesheet entries for project tracking';
COMMENT ON VIEW timesheet_report IS 'Comprehensive view of timesheets with user details';