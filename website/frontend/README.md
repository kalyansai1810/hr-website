# HR Website Frontend

A modern React-based frontend for the HR timesheet management system.

## Features

### ✅ Completed
- **Authentication System**: Login/Register with JWT token management
- **Role-Based Navigation**: Dynamic sidebar based on user roles (Admin, HR, Manager, Employee)
- **Dashboard Components**: Role-specific dashboards with statistics and quick actions
- **Timesheet Management**: Complete timesheet submission, viewing, and approval workflows
- **Project Management**: HR can create projects and assign employees
- **User Management**: Admin can manage users and roles
- **Modern UI**: Responsive design with Tailwind CSS

### 🎯 Key Components

#### Authentication (`src/components/auth/`)
- **Login.js**: Login form with demo account information
- **Register.js**: User registration form
- **AuthContext.js**: JWT token management and role-based utilities

#### Dashboards (`src/components/dashboards/`)
- **Dashboard.js**: Role-specific dashboard with statistics and quick actions

#### Timesheets (`src/components/timesheets/`)
- **TimesheetSubmission.js**: Employee timesheet submission form
- **TimesheetManagement.js**: View personal timesheet history
- **TimesheetApproval.js**: Manager/Admin timesheet approval interface

#### Projects (`src/components/projects/`)
- **ProjectManagement.js**: HR project creation and employee assignment

#### Users (`src/components/users/`)
- **UserManagement.js**: Admin user management interface

#### Layout (`src/components/layout/`)
- **Sidebar.js**: Role-based navigation sidebar

## Role-Based Access

### 👤 Employee
- Submit timesheets for assigned projects
- View personal timesheet history
- Access dashboard with personal statistics

### 👥 Manager  
- All Employee features
- Approve/reject team member timesheets
- View team timesheet statistics

### 🏢 HR
- All Manager features
- Create and manage projects
- Assign employees to projects
- View all timesheets

### ⚡ Admin
- All HR features
- Create and manage users
- Full system access
- View system-wide statistics

## Demo Accounts

The following demo accounts are available for testing:

```
Admin: admin@company.com / admin123
HR: hr@company.com / hr123  
Manager: manager@company.com / manager123
Employee: employee@company.com / employee123
```

## Tech Stack

- **React 18.2.0**: Modern React with hooks
- **React Router 6**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icons
- **Axios**: HTTP client for API calls
- **React Toastify**: Toast notifications
- **React Hook Form**: Form handling

## Getting Started

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## API Integration

The frontend is configured to connect to the Spring Boot backend at `http://localhost:8080`. All API calls include JWT tokens for authentication.

### Key API Endpoints Used:
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/timesheets` - Get user timesheets
- `POST /api/timesheets` - Submit timesheet
- `PUT /api/manager/timesheets/{id}/approve` - Approve timesheet
- `PUT /api/manager/timesheets/{id}/reject` - Reject timesheet
- `GET /api/hr/projects` - Get projects (HR)
- `POST /api/hr/projects` - Create project (HR)
- `POST /api/hr/assignments` - Assign employee to project (HR)
- `GET /api/admin/users` - Get all users (Admin)
- `POST /api/admin/users` - Create user (Admin)

## Features Highlights

### 🔐 Security
- JWT token authentication
- Role-based access control
- Protected routes
- Automatic token refresh handling

### 🎨 UI/UX
- Responsive design for all screen sizes
- Clean, modern interface
- Intuitive navigation
- Loading states and error handling
- Toast notifications for user feedback

### 📊 Dashboard Analytics
- Role-specific statistics
- Quick action buttons
- Recent activity feed
- Visual status indicators

### ⚡ Performance
- Optimized React hooks
- Efficient API calls
- Lazy loading where appropriate
- Minimal bundle size

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── dashboards/    # Dashboard components  
│   │   ├── layout/        # Layout components
│   │   ├── projects/      # Project management
│   │   ├── timesheets/    # Timesheet components
│   │   └── users/         # User management
│   ├── contexts/
│   │   └── AuthContext.js # Authentication context
│   ├── App.js            # Main app component with routing
│   ├── index.js          # App entry point
│   └── index.css         # Global styles
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Status: ✅ Ready for Use

The frontend is fully functional and ready for integration with the Spring Boot backend. All major features have been implemented with proper error handling, loading states, and user feedback.

To complete the full-stack setup, ensure the Spring Boot backend is running on port 8080.