# Student Attendance and Result Portal

A comprehensive web-based portal for managing student attendance and academic results. Built with pure HTML, CSS, and Vanilla JavaScript with Local Storage for data persistence.

## 🎯 Features

### Three User Roles
- **Admin**: Manage students, teachers, courses, and view system-wide reports
- **Teacher**: Mark attendance, upload results, and manage assigned courses
- **Student**: View personal attendance records and academic results

### Core Functionality
- **Attendance Management**: Mark daily attendance, view attendance history, track attendance percentage
- **Result Management**: Upload marks for quizzes, assignments, mid-terms, and finals with automatic grade calculation
- **GPA Calculation**: Automatic GPA calculation based on grades
- **Dashboard Analytics**: Visual statistics and performance indicators

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and page structure
- **CSS3**: Modern styling with CSS Variables, Flexbox, and Grid
- **Vanilla JavaScript**: ES6+ features, DOM manipulation, modular architecture
- **Local Storage**: Client-side data persistence

## 📁 Project Structure

```
student-portal/
├── index.html                 # Login page
├── css/
│   ├── main.css              # Global styles and design system
│   ├── login.css             # Login page styles
│   └── dashboard.css         # Dashboard layout styles
├── js/
│   ├── storage.js            # Local Storage management
│   ├── auth.js               # Authentication handler
│   ├── attendance.js         # Attendance operations
│   ├── results.js            # Results/grades operations
│   ├── ui.js                 # Common UI utilities
│   ├── login.js              # Login page controller
│   ├── admin-dashboard.js    # Admin dashboard controller
│   ├── teacher-dashboard.js  # Teacher dashboard controller
│   ├── teacher-attendance.js # Attendance marking controller
│   ├── teacher-results.js    # Results upload controller
│   ├── student-dashboard.js  # Student dashboard controller
│   ├── student-attendance.js # Student attendance view controller
│   └── student-results.js    # Student results view controller
├── pages/
│   ├── admin/
│   │   └── dashboard.html    # Admin dashboard
│   ├── teacher/
│   │   ├── dashboard.html    # Teacher dashboard
│   │   ├── attendance.html   # Mark attendance page
│   │   └── results.html      # Upload results page
│   └── student/
│       ├── dashboard.html    # Student dashboard
│       ├── attendance.html   # View attendance page
│       └── results.html      # View results page
└── data/
    └── (Local Storage)       # Browser-based storage
```

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- A local web server (optional, but recommended for best experience)

### Installation

1. **Clone or Download** the project files to your local machine

2. **Open the project**:
   - **Option A**: Simply double-click `index.html` to open in your browser
   - **Option B**: Use a local server:
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (npx)
     npx serve
     
     # Using VS Code Live Server extension
     # Right-click index.html → "Open with Live Server"
     ```

3. **Access the application** at `http://localhost:8000` (if using a server)

## 🔐 Demo Credentials

| Role | User ID | Password |
|------|---------|----------|
| Admin | admin001 | admin123 |
| Teacher | teacher001 | teacher123 |
| Student | student001 | student123 |

## 📊 Grading Scale

| Grade | Percentage | Grade Points |
|-------|------------|--------------|
| A+ | 90-100% | 4.0 |
| A | 85-89% | 4.0 |
| A- | 80-84% | 3.7 |
| B+ | 75-79% | 3.3 |
| B | 70-74% | 3.0 |
| B- | 65-69% | 2.7 |
| C+ | 60-64% | 2.3 |
| C | 55-59% | 2.0 |
| C- | 50-54% | 1.7 |
| D | 45-49% | 1.0 |
| F | Below 45% | 0.0 |

## 🏗️ Architecture

### 3-Tier Client-Side Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│         (HTML Pages + CSS Styling + UI Components)          │
├─────────────────────────────────────────────────────────────┤
│                      LOGIC LAYER                             │
│    (JavaScript Modules: Auth, Attendance, Results, UI)      │
├─────────────────────────────────────────────────────────────┤
│                       DATA LAYER                             │
│        (StorageManager + Local Storage + JSON Data)         │
└─────────────────────────────────────────────────────────────┘
```

### JavaScript Modules

| Module | Purpose |
|--------|---------|
| `StorageManager` | CRUD operations for Local Storage |
| `AuthManager` | Login/logout, session management, page protection |
| `AttendanceManager` | Mark and retrieve attendance records |
| `ResultsManager` | Manage grades, calculate totals and GPA |
| `UIManager` | Toast notifications, modals, date formatting |

## 🎨 Design System

### Color Palette
- **Primary**: `#4F46E5` (Indigo)
- **Success**: `#10B981` (Emerald)
- **Warning**: `#F59E0B` (Amber)
- **Danger**: `#EF4444` (Red)
- **Background**: `#F9FAFB`
- **Text Primary**: `#111827`
- **Text Secondary**: `#6B7280`

### Responsive Breakpoints
- **Extra Large**: 1200px and above
- **Large**: 992px - 1199px
- **Medium**: 768px - 991px
- **Small**: 576px - 767px
- **Extra Small**: Below 576px

## 📱 Features by Role

### Admin Dashboard
- ✅ View all students list
- ✅ Add new students
- ✅ View system statistics
- ✅ Search and filter students

### Teacher Dashboard
- ✅ View assigned courses
- ✅ Mark attendance for courses
- ✅ Upload marks for students
- ✅ View attendance statistics

### Student Dashboard
- ✅ View personal dashboard with GPA
- ✅ Check attendance records by course
- ✅ View detailed marks breakdown
- ✅ Track academic progress

## 🔄 Data Persistence

All data is stored in the browser's Local Storage. The application initializes with sample data on first load:

- **Users**: Admin, teachers, and students with credentials
- **Courses**: Sample courses with assigned teachers
- **Students**: Sample student records
- **Attendance**: Sample attendance history
- **Results**: Sample academic results

To reset all data to defaults, you can clear Local Storage through browser developer tools or call `StorageManager.reset()` in the console.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Student Portal Project - Built for educational purposes

---

**Note**: This is a frontend-only application. For production use, implement a proper backend with secure authentication and a database for data persistence.
