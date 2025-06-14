# NexStaff Admin Dashboard

A modern, fully functional admin dashboard for the NexStaff staffing platform.

## Features

### 🔐 Authentication
- Email-based login system
- Session management with localStorage
- Auto-redirect to login if not authenticated
- Remember me functionality

### 📊 Dashboard Overview
- Real-time statistics for employees, candidates, jobs, and applications
- Quick action buttons for common tasks
- Recent activities and hires overview
- Modern responsive design

### 👥 Employee Management
- Complete CRUD operations for employees
- Modal-based forms for adding/editing employees
- Employee search and filtering
- Department-based organization
- Status tracking (Active, Inactive, Training, On Leave)

### 🎯 Candidate Management
- Candidate profiles with skills and experience tracking
- Application status monitoring
- Interview scheduling integration
- Search and filter capabilities

### 🏢 Employer Management
- Employer/client company management
- Contact information tracking
- Job posting management per employer

### 💼 Job Management
- Job posting creation and management
- Application tracking per job
- Status management (Active, Filled, On Hold, Closed)
- Department and location filtering

### 📝 Application Management
- Application review and approval workflow
- Candidate scoring system
- Interview scheduling from applications
- Bulk operations for efficiency

### 📅 Schedule Management
- Interview scheduling system
- Calendar view of upcoming events
- Today's schedule overview
- Integration with applications and candidates

### ⚙️ Settings
- System configuration
- User account management
- Company information settings
- Security settings with password update

## Login Credentials

```
Email: admin@nexstaff.com
Password: admin123
```

## File Structure

```
login/
├── login.html              # Login page
├── admin/
│   ├── dashboard.html       # Main admin dashboard
│   ├── css/
│   │   ├── login.css       # Login page styles
│   │   └── dashboard.css   # Dashboard styles
│   ├── js/
│   │   └── auth.js         # Authentication logic
│   └── img/
│       └── logo.png        # NexStaff logo
```

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Custom Properties, CSS Grid, Flexbox
- **Icons**: Font Awesome 6.5.0
- **Fonts**: Inter (Google Fonts)
- **Storage**: localStorage for session management
- **Responsive**: Mobile-first design approach

## Key Components

### Navigation System
- Collapsible sidebar with modern design
- Mobile-responsive hamburger menu
- Active state management
- Smooth transitions

### Modal System
- Reusable modal components
- Form validation
- Loading states
- Backdrop blur effects

### Notification System
- Toast-style notifications
- Success, error, info, and warning types
- Auto-dismiss functionality
- Smooth animations

### Data Management
- localStorage-based data persistence
- Sample data for demonstration
- CRUD operations with simulated API calls
- Form validation and error handling

## Usage

1. **Login**: Navigate to `login/login.html` and use the provided credentials
2. **Dashboard**: View overview statistics and recent activities
3. **Employee Management**: Add, edit, view, and manage employee records
4. **Application Workflow**: Review applications, schedule interviews, and manage hiring process
5. **Settings**: Configure system settings and user preferences

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development Notes

- All data is currently stored in localStorage for demonstration
- API endpoints are simulated with setTimeout functions
- Real backend integration can be added by replacing localStorage calls with HTTP requests
- The system is designed to be easily extensible with additional modules

## Future Enhancements

- Real-time notifications with WebSocket
- Advanced reporting and analytics
- Document management system
- Email integration for notifications
- Calendar integration (Google Calendar, Outlook)
- Advanced search with filters
- Bulk operations for all entities
- Export functionality (PDF, Excel)
- Multi-tenant support
- Role-based access control
