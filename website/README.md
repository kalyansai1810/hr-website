# HR Website - Enterprise Spring Boot Application

A comprehensive Human Resources management system built with Spring Boot, featuring JWT authentication, 4-role access control, and complete timesheet workflow automation.

## 🏗️ Project Architecture

### Technology Stack
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: PostgreSQL 17.6
- **Security**: JWT Authentication with Spring Security
- **Build Tool**: Maven
- **Architecture**: Layered Enterprise Architecture

### Enterprise Architecture Components
```
├── Controllers (API Layer - Role-based Endpoints)
├── DTOs (Data Transfer Objects)
├── Services (Business Logic Layer)
├── Repositories (Data Access Layer with JOIN FETCH)
├── Models (JPA Entities with Lazy Loading)
├── Security (JWT + Role-based Authorization)
├── Validation (Enterprise Validators)
├── Exception Handling (Global Error Handling)
└── Configuration (Application Settings)
```

## 🚀 Quick Start

### Prerequisites
- Java 17+
- PostgreSQL 17.6
- Maven (or use included wrapper)

### 1. Database Setup
```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE hrdb;
CREATE USER hruser WITH ENCRYPTED PASSWORD 'hrpassword123';
GRANT ALL PRIVILEGES ON DATABASE hrdb TO hruser;
```

### 2. Build & Run Application
```bash
# Clone or navigate to project directory
cd D:\website

# Build the application
.\mvnw.cmd clean package -DskipTests

# Run the application
java -jar target/hr-website-0.0.1-SNAPSHOT.jar
```

### 3. Application URLs
- **Application**: http://localhost:8081
- **Health Check**: http://localhost:8081/actuator/health
- **Metrics**: http://localhost:8081/actuator/metrics

## 🎯 Complete HR Workflow System

### 4-Role Access Control
- **ADMIN**: Complete system administration
- **HR**: Project allocation and employee management
- **MANAGER**: Timesheet approval and team management
- **EMPLOYEE**: Timesheet submission for assigned projects

### Workflow Process
1. **HR** creates projects and assigns employees to them
2. **EMPLOYEE** submits timesheets for assigned projects
3. **MANAGER** approves or rejects submitted timesheets
4. **ADMIN** oversees complete system operations

## 📋 API Documentation

### Authentication Endpoints

#### Admin Registration
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "System Admin",
    "email": "admin@example.com",
    "password": "password123",
    "role": "ADMIN"
  }'
```

#### HR Registration
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HR Manager",
    "email": "hr@example.com",
    "password": "password123",
    "role": "HR"
  }'
```

#### Manager Registration
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Team Manager",
    "email": "manager@example.com",
    "password": "password123",
    "role": "MANAGER"
  }'
```

#### Employee Registration
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Employee",
    "email": "employee@example.com",
    "password": "password123",
    "role": "EMPLOYEE"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "name": "John Employee",
      "email": "employee@example.com",
      "role": "EMPLOYEE"
    }
  }
}
```

### Admin Endpoints (ADMIN Role Required)

#### Create User
```bash
curl -X POST http://localhost:8081/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "name": "New Employee",
    "email": "newemployee@example.com",
    "password": "password123",
    "role": "EMPLOYEE",
    "managerId": 2
  }'
```

#### Get All Users
```bash
curl -X GET http://localhost:8081/api/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Update User
```bash
curl -X PUT http://localhost:8081/api/admin/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "MANAGER"
  }'
```

#### Delete User
```bash
curl -X DELETE http://localhost:8081/api/admin/users/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### HR Endpoints (HR Role Required)

#### Create Project
```bash
curl -X POST http://localhost:8081/api/hr/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer HR_JWT_TOKEN" \
  -d '{
    "name": "Project Alpha",
    "description": "Main development project",
    "code": "PROJ001",
    "client": "ABC Corporation",
    "projectManagerId": 3
  }'
```

#### Get All Projects
```bash
curl -X GET http://localhost:8081/api/hr/projects \
  -H "Authorization: Bearer HR_JWT_TOKEN"
```

#### Assign Employee to Project
```bash
curl -X POST http://localhost:8081/api/hr/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer HR_JWT_TOKEN" \
  -d '{
    "employeeId": 4,
    "projectId": 1,
    "notes": "Frontend development lead"
  }'
```

#### View Project Assignments
```bash
curl -X GET http://localhost:8081/api/hr/assignments/project/1 \
  -H "Authorization: Bearer HR_JWT_TOKEN"
```

#### View Employee Assignments
```bash
curl -X GET http://localhost:8081/api/hr/assignments/employee/4 \
  -H "Authorization: Bearer HR_JWT_TOKEN"
```

#### View All Timesheets
```bash
curl -X GET http://localhost:8081/api/hr/timesheets \
  -H "Authorization: Bearer HR_JWT_TOKEN"
```

## ✅ Recent UI changes

- Weekly grouped timesheet view: timesheets are now grouped by week (Monday–Sunday) and display per-day status badges and a weekly overall status (APPROVED / REJECTED / PENDING). This view is read-only in the `TimesheetManagement` page so HR and employees can review historical weeks without performing approve/reject actions there.
- Manager approval workflow: managers should use the `TimesheetApproval` page to review pending weekly timesheets grouped by employee/project/week. Managers can approve or reject individual days within a week and provide rejection reasons when applicable.

## 🧭 Frontend (React) - Local development

To run the frontend locally (development mode with hot-reload):

```powershell
cd D:\website\frontend
$env:PORT=3000
npm start
```

Open http://localhost:3000 and log in with a demo account (see demo credentials in the frontend README). If you are logged in as HR open the "All Timesheets" (Manage) page to see the weekly grouped read-only view. Managers should use the "Timesheet Approval" page to act on pending timesheets.


#### Get All Employees
```bash
curl -X GET http://localhost:8081/api/hr/employees \
  -H "Authorization: Bearer HR_JWT_TOKEN"
```

#### Get All Managers
```bash
curl -X GET http://localhost:8081/api/hr/managers \
  -H "Authorization: Bearer HR_JWT_TOKEN"
```

### Manager Endpoints (MANAGER Role Required)

#### View Managed Employee Timesheets
```bash
curl -X GET http://localhost:8081/api/manager/timesheets \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

#### Approve Timesheet
```bash
curl -X PUT http://localhost:8081/api/manager/timesheets/1/approve \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

#### Reject Timesheet
```bash
curl -X PUT http://localhost:8081/api/manager/timesheets/1/reject \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

#### View Managed Employees
```bash
curl -X GET http://localhost:8081/api/manager/employees \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

### Employee Endpoints (EMPLOYEE Role Required)

#### Submit Timesheet
```bash
curl -X POST http://localhost:8081/api/timesheets/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer EMPLOYEE_JWT_TOKEN" \
  -d '{
    "projectId": 1,
    "date": "2025-10-01",
    "hours": 8.0,
    "notes": "Working on authentication module"
  }'
```

#### View My Timesheets
```bash
curl -X GET http://localhost:8081/api/timesheets \
  -H "Authorization: Bearer EMPLOYEE_JWT_TOKEN"
```

#### View Assigned Projects
```bash
curl -X GET http://localhost:8081/api/timesheets/projects \
  -H "Authorization: Bearer EMPLOYEE_JWT_TOKEN"
```

## 🔒 Security & Authorization

### 4-Role Access Control System
- **ADMIN**: Complete system administration, user management
- **HR**: Project creation, employee assignments, view all timesheets
- **MANAGER**: Approve/reject timesheets from managed employees
- **EMPLOYEE**: Submit timesheets for assigned projects only

### JWT Token Usage
1. Login to get JWT token
2. Include token in Authorization header: `Bearer YOUR_TOKEN`
3. Token expires in 24 hours (configurable)

### Protected Endpoints
- **Admin Only**: `/api/admin/*`
- **HR Only**: `/api/hr/*`
- **Manager Only**: `/api/manager/*`
- **Employee/Manager**: `/api/timesheets/*`
- **All Authenticated**: `/api/auth/profile`

## 📊 Response Format

All API responses follow a standardized format:

```json
{
  "success": true|false,
  "message": "Description of the operation",
  "data": {
    // Response data object
  },
  "error": "Error details (if applicable)"
}
```

### Error Response Example
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "error": "Email already exists in system"
}
```

## 🏢 Business Rules

### Timesheet Workflow
1. **HR** creates projects and assigns employees
2. **EMPLOYEE** submits timesheets for assigned projects (status: PENDING)
3. **MANAGER** approves or rejects timesheets
4. **Final States**: APPROVED or REJECTED

### Employee-Project Assignment Rules
- Employees can only submit timesheets for assigned projects
- HR manages all project assignments
- Managers can only approve timesheets from their managed employees

### User Hierarchy Rules
- Employees report to managers
- Managers can have multiple employees
- HR and Admin have organization-wide access
- Users can only be assigned one manager

### Validation Rules
- **Hours**: 0.5-24 hours per timesheet entry
- **Date**: Cannot be in the future
- **Project Assignment**: Must exist before timesheet submission
- **Role Hierarchy**: Enforced through Spring Security
- **Email**: Must be unique across system
- **Password**: Minimum 6 characters with complexity requirements

## 🛠️ Development Commands

### Build Commands
```bash
# Clean build
.\mvnw.cmd clean package -DskipTests

# Run with Maven
.\mvnw.cmd spring-boot:run

# Run JAR directly
java -jar target/hr-website-0.0.1-SNAPSHOT.jar
```

### Database Management
```bash
# Backup database
.\backup-database.bat

# Restore database
.\restore-database.bat backup_filename.sql

# Manual setup
psql -U postgres -f database-setup.sql
```

## 📁 Project Structure

```
hr-website/
├── src/main/java/com/example/hrwebsite/
│   ├── aspect/              # AOP logging aspects
│   ├── config/              # Configuration classes
│   ├── controller/          # REST API controllers
│   │   ├── AdminController.java       # Admin operations
│   │   ├── HRController.java          # HR operations
│   │   ├── ManagerController.java     # Manager operations
│   │   ├── TimesheetController.java   # Employee timesheets
│   │   └── AuthController.java        # Authentication
│   ├── dto/                 # Data Transfer Objects
│   │   ├── ApiResponse.java
│   │   ├── UserResponse.java
│   │   ├── ProjectResponse.java
│   │   ├── TimesheetResponse.java
│   │   └── AssignmentResponse.java
│   ├── exception/           # Exception handling
│   ├── model/               # JPA entities
│   │   ├── User.java
│   │   ├── Project.java
│   │   ├── Timesheet.java
│   │   └── EmployeeProjectAssignment.java
│   ├── repository/          # Data access layer with JOIN FETCH
│   │   ├── UserRepository.java
│   │   ├── ProjectRepository.java
│   │   ├── TimesheetRepository.java
│   │   └── EmployeeProjectAssignmentRepository.java
│   ├── security/            # JWT security implementation
│   ├── service/             # Business logic layer
│   ├── validation/          # Custom validators
│   └── HrWebsiteApplication.java
├── src/main/resources/
│   ├── application.properties
│   └── logback-spring.xml
├── logs/                    # Application logs
├── backups/                 # Database backups
├── database-setup.sql       # Database initialization
├── backup-database.bat      # Backup script
├── restore-database.bat     # Restore script
└── pom.xml                  # Maven configuration
```

## 🔧 Configuration

### Database Configuration (application.properties)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hrdb
spring.datasource.username=hruser
spring.datasource.password=hrpassword123
server.port=8081
spring.jpa.hibernate.ddl-auto=update
```

### JWT Configuration
```properties
app.jwt.secret=BASE64_ENCODED_SECRET
app.jwt.expiration-ms=86400000
```

## 📝 Logging

### Log Files
- **Main Log**: `logs/hr-website.log`
- **Error Log**: `logs/hr-website-error.log`

### Log Levels
- **DEBUG**: Application components (com.example.hrwebsite)
- **INFO**: General application flow
- **ERROR**: Application errors and exceptions

## 🧪 Testing

### Complete Workflow Testing
1. **Admin Setup**: Create HR, Manager, and Employee users
2. **HR Operations**: Create projects and assign employees
3. **Employee Actions**: Submit timesheets for assigned projects
4. **Manager Approval**: Review and approve/reject timesheets
5. **System Verification**: Check all role-based access controls

### Test Sequence
```bash
# 1. Create Admin user
curl -X POST http://localhost:8081/api/auth/register -H "Content-Type: application/json" -d '{"name": "Admin", "email": "admin@example.com", "password": "password123", "role": "ADMIN"}'

# 2. Admin creates HR user
curl -X POST http://localhost:8081/api/admin/users -H "Authorization: Bearer ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"name": "HR Manager", "email": "hr@example.com", "password": "password123", "role": "HR"}'

# 3. HR creates project
curl -X POST http://localhost:8081/api/hr/projects -H "Authorization: Bearer HR_TOKEN" -H "Content-Type: application/json" -d '{"name": "Test Project", "description": "Testing", "code": "TEST001", "client": "Test Client"}'

# 4. HR assigns employee to project
curl -X POST http://localhost:8081/api/hr/assignments -H "Authorization: Bearer HR_TOKEN" -H "Content-Type: application/json" -d '{"employeeId": 4, "projectId": 1, "notes": "Test assignment"}'

# 5. Employee submits timesheet
curl -X POST http://localhost:8081/api/timesheets/submit -H "Authorization: Bearer EMPLOYEE_TOKEN" -H "Content-Type: application/json" -d '{"projectId": 1, "hours": 8.0, "date": "2025-01-15", "notes": "Development work"}'

# 6. Manager approves timesheet
curl -X PUT http://localhost:8081/api/manager/timesheets/1/approve -H "Authorization: Bearer MANAGER_TOKEN"
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check if PostgreSQL is running
# Verify database credentials in application.properties
# Check if port 8081 is available
```

#### JWT Token Issues
- Ensure token is included in Authorization header
- Verify token hasn't expired (24 hours)
- Check role-based access (MANAGER vs EMPLOYEE)

#### Database Connection Issues
- Verify PostgreSQL service is running
- Check database exists and user has permissions
- Confirm connection details in application.properties

### Health Checks
```bash
# Application health
curl http://localhost:8081/actuator/health

# Database connection
curl http://localhost:8081/actuator/metrics/jdbc.connections.active
```

## 📈 Monitoring

### Available Actuator Endpoints
- `/actuator/health` - Application health status
- `/actuator/info` - Application information
- `/actuator/metrics` - Application metrics
- `/actuator/loggers` - Logger configuration

### Performance Monitoring
- AOP aspects log method execution times
- Slow operations (>1000ms) are logged as warnings
- Database connection pool monitoring via HikariCP

## 🎯 Features Implemented

### ✅ Core Features
- [x] **4-Role Access Control**: ADMIN, HR, MANAGER, EMPLOYEE
- [x] **JWT Authentication**: Secure token-based authentication
- [x] **Project Management**: HR can create and manage projects
- [x] **Employee Assignment**: HR assigns employees to projects
- [x] **Timesheet Submission**: Employees submit for assigned projects only
- [x] **Manager Approval**: Managers approve/reject timesheets from managed employees
- [x] **Lazy Loading Optimization**: Enhanced JOIN FETCH queries prevent N+1 problems
- [x] **Role-based Authorization**: Spring Security method-level security
- [x] **Global Exception Handling**: Standardized error responses
- [x] **Audit Logging**: AOP-based operation logging
- [x] **Data Validation**: Comprehensive input validation
- [x] **Circular Reference Prevention**: Safe entity relationships

### ✅ Technical Features
- [x] **Database Relationships**: Complex JPA entity relationships
- [x] **Transaction Management**: @Transactional service methods
- [x] **Repository Pattern**: Clean separation of data access
- [x] **DTO Pattern**: Secure data transfer objects
- [x] **Builder Pattern**: Fluent API response builders
- [x] **Configuration Management**: Externalized configuration
- [x] **Health Monitoring**: Spring Boot Actuator endpoints
- [x] **Production Logging**: Structured logging with rotation

## 🎯 Future Enhancements

### Planned Features
- [ ] Email notifications for timesheet approvals
- [ ] Reporting and analytics dashboard
- [ ] Bulk timesheet operations
- [ ] Employee leave management
- [ ] Integration with payroll systems
- [ ] Mobile application support
- [ ] Advanced search and filtering
- [ ] Audit trail for all operations
- [ ] File attachment support for timesheets
- [ ] Calendar integration
- [ ] Time tracking with start/stop functionality
- [ ] Overtime calculations
- [ ] Department-based project filtering

### Technical Improvements
- [ ] Unit and integration tests (JUnit 5 + TestContainers)
- [ ] Docker containerization
- [ ] CI/CD pipeline setup (GitHub Actions)
- [ ] API versioning
- [ ] Rate limiting
- [ ] Redis caching implementation
- [ ] Database migrations with Flyway
- [ ] OpenAPI/Swagger documentation
- [ ] Performance monitoring
- [ ] Security enhancements (CSRF, XSS protection)
- [ ] Microservices architecture migration
- [ ] Event-driven architecture with Spring Cloud Stream

---

## 📞 Support

For technical issues or questions about the HR Website system, please refer to:
- Application logs in `logs/` directory
- Health check endpoints for system status
- Database backup utilities for data recovery

## 📄 License

This project is part of an enterprise HR management system. All rights reserved.

---

## 🎉 System Status

✅ **Production Ready**: Complete 4-role HR workflow system
🔐 **Secure**: JWT authentication with role-based authorization  
⚡ **Optimized**: Lazy loading issues resolved with JOIN FETCH
🏗️ **Enterprise Architecture**: Layered design with separation of concerns
📊 **Comprehensive**: Admin → HR → Manager → Employee workflow complete