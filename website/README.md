# HR Website - Enterprise Spring Boot Application

A comprehensive Human Resources management system built with Spring Boot, featuring JWT authentication, role-based access control, and enterprise-level architecture patterns.

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
├── Controllers (API Layer)
├── DTOs (Data Transfer Objects)
├── Services (Business Logic Layer)
├── Repositories (Data Access Layer)
├── Models (JPA Entities)
├── Security (JWT + Spring Security)
├── Validation (Custom Validators)
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
java -cp ".mvn\wrapper\maven-wrapper.jar" "-Dmaven.multiModuleProjectDirectory=D:\website" org.apache.maven.wrapper.MavenWrapperMain clean package -DskipTests

# Run the application
java -jar target/hr-website-0.0.1-SNAPSHOT.jar
```

### 3. Application URLs
- **Application**: http://localhost:8081
- **Health Check**: http://localhost:8081/actuator/health
- **Metrics**: http://localhost:8081/actuator/metrics

## 📋 API Documentation

### Authentication Endpoints

#### Register User
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Employee",
    "email": "employee@company.com",
    "password": "password123",
    "role": "EMPLOYEE"
  }'
```

#### Register Manager
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Manager",
    "email": "manager@company.com",
    "password": "password123",
    "role": "MANAGER"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@company.com",
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
      "email": "employee@company.com",
      "role": "EMPLOYEE"
    }
  }
}
```

### Employee Timesheet Endpoints

#### Submit Timesheet
```bash
curl -X POST http://localhost:8081/api/timesheets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "date": "2025-10-01",
    "hours": 8,
    "project": "Project Alpha",
    "notes": "Working on user authentication module"
  }'
```

#### Get My Timesheets
```bash
curl -X GET http://localhost:8081/api/timesheets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Specific Timesheet
```bash
curl -X GET http://localhost:8081/api/timesheets/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Timesheet
```bash
curl -X PUT http://localhost:8081/api/timesheets/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "date": "2025-10-01",
    "hours": 7,
    "project": "Project Alpha",
    "notes": "Updated hours after review"
  }'
```

#### Delete Timesheet
```bash
curl -X DELETE http://localhost:8081/api/timesheets/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Manager Endpoints

#### Get All Users
```bash
curl -X GET http://localhost:8081/api/manager/users \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

#### Get All Timesheets
```bash
curl -X GET http://localhost:8081/api/manager/timesheets \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

#### Get Pending Timesheets
```bash
curl -X GET http://localhost:8081/api/manager/timesheets/pending \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

#### Get Timesheets by Status
```bash
curl -X GET http://localhost:8081/api/manager/timesheets/status/APPROVED \
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

## 🔒 Security & Authorization

### Roles
- **EMPLOYEE**: Can manage own timesheets
- **MANAGER**: Can view all users, timesheets, and approve/reject timesheets

### JWT Token Usage
1. Login to get JWT token
2. Include token in Authorization header: `Bearer YOUR_TOKEN`
3. Token expires in 24 hours (configurable)

### Protected Endpoints
- All `/api/timesheets/*` - Requires authentication
- All `/api/manager/*` - Requires MANAGER role

## 📊 Response Format

All API responses follow a standardized format:

```json
{
  "success": true|false,
  "message": "Description of the operation",
  "data": {
    // Response data object
  }
}
```

### Error Response Example
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Please provide a valid email address",
    "password": "Password must be at least 6 characters"
  }
}
```

## 🏢 Business Rules

### Timesheet Status Flow
1. **PENDING** → Created by employee (default status)
2. **APPROVED** → Approved by manager
3. **REJECTED** → Rejected by manager

### Current Status Change Rules
- Managers can change status from any state to any other state
- Employees can only create and update PENDING timesheets
- Once approved/rejected, only managers can modify

### Validation Rules
- **Hours**: 1-24 hours per day
- **Date**: Cannot be in the future
- **Project**: 2-255 characters, alphanumeric with spaces, hyphens, underscores, dots
- **Role**: Must be either EMPLOYEE or MANAGER
- **Email**: Must be valid email format
- **Password**: Minimum 6 characters

## 🛠️ Development Commands

### Build Commands
```bash
# Clean build
java -cp ".mvn\wrapper\maven-wrapper.jar" "-Dmaven.multiModuleProjectDirectory=D:\website" org.apache.maven.wrapper.MavenWrapperMain clean package -DskipTests

# Run with Maven
java -cp ".mvn\wrapper\maven-wrapper.jar" "-Dmaven.multiModuleProjectDirectory=D:\website" org.apache.maven.wrapper.MavenWrapperMain spring-boot:run

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
│   ├── dto/                 # Data Transfer Objects
│   ├── exception/           # Exception handling
│   ├── model/               # JPA entities
│   ├── repository/          # Data access layer
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

### Manual Testing with Postman
1. Import the curl commands as Postman collection
2. Set up environment variables for base URL and tokens
3. Test authentication flow
4. Test employee timesheet operations
5. Test manager approval workflow

### Test Data
The application starts with an empty database. Create test users using the registration endpoint.

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

### Technical Improvements
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline setup
- [ ] API versioning
- [ ] Rate limiting
- [ ] Caching implementation
- [ ] Database migrations with Flyway
- [ ] OpenAPI/Swagger documentation

---

## 📞 Support

For technical issues or questions about the HR Website system, please refer to:
- Application logs in `logs/` directory
- Health check endpoints for system status
- Database backup utilities for data recovery

## 📄 License

This project is part of an enterprise HR management system. All rights reserved.