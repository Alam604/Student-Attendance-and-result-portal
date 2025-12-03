/* =============================================
   STUDENT DASHBOARD CONTROLLER
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    // Protect page - only student can access
    if (!AuthManager.protectPage('student')) {
        return;
    }

    // Initialize dashboard
    initDashboard();
    loadStudentInfo();
    loadDashboardStats();
    loadCourses();
    loadRecentResults();
});

/**
 * Initialize dashboard UI components
 */
function initDashboard() {
    UIManager.initDashboard();
    UIManager.setActiveNav('dashboard');
}

/**
 * Load student information
 */
function loadStudentInfo() {
    const user = AuthManager.getCurrentUser();
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const student = students.find(s => s.id === user.userId);
    
    // Update welcome message
    const nameEl = document.getElementById('studentName');
    if (nameEl && student) {
        nameEl.textContent = student.name.split(' ')[0]; // First name only
    }
    
    // Update sidebar course list
    loadSidebarCourses(student);
}

/**
 * Load sidebar courses
 */
function loadSidebarCourses(student) {
    const coursesList = document.getElementById('coursesList');
    if (!coursesList || !student) return;
    
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    const enrolledCourses = courses.filter(c => student.enrolledCourses.includes(c.id));
    
    if (enrolledCourses.length === 0) {
        coursesList.innerHTML = '<div class="nav-link text-muted">No courses enrolled</div>';
        return;
    }
    
    coursesList.innerHTML = enrolledCourses.map(course => `
        <a href="attendance.html?course=${course.id}" class="nav-link">
            <span class="icon">📖</span>
            <span>${course.code}</span>
        </a>
    `).join('');
}

/**
 * Load dashboard statistics
 */
function loadDashboardStats() {
    const user = AuthManager.getCurrentUser();
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const student = students.find(s => s.id === user.userId);
    
    if (!student) return;
    
    // Get GPA
    const gpaInfo = ResultsManager.getStudentGPA(student.id);
    document.getElementById('studentGPA').textContent = gpaInfo.gpa;
    document.getElementById('gpaCredits').textContent = `${gpaInfo.totalCredits} credits`;
    
    // Get overall attendance
    const attendanceStats = AttendanceManager.getOverallAttendance(student.id);
    document.getElementById('overallAttendance').textContent = attendanceStats.percentage + '%';
    
    // Set attendance status
    const attendanceStatus = document.getElementById('attendanceStatus');
    if (attendanceStats.percentage >= 75) {
        attendanceStatus.className = 'stat-change positive';
        attendanceStatus.innerHTML = '<span>✓ Good standing</span>';
    } else if (attendanceStats.percentage >= 50) {
        attendanceStatus.className = 'stat-change';
        attendanceStatus.innerHTML = '<span>⚠ Needs improvement</span>';
    } else {
        attendanceStatus.className = 'stat-change negative';
        attendanceStatus.innerHTML = '<span>⚠ At risk</span>';
    }
    
    // Get enrolled courses count
    document.getElementById('enrolledCourses').textContent = student.enrolledCourses.length;
    
    // Get results count
    const results = ResultsManager.getStudentResults(student.id);
    document.getElementById('resultsCount').textContent = results.length;
}

/**
 * Load courses grid
 */
function loadCourses() {
    const user = AuthManager.getCurrentUser();
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const student = students.find(s => s.id === user.userId);
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    
    if (!student) return;
    
    const enrolledCourses = courses.filter(c => student.enrolledCourses.includes(c.id));
    const coursesGrid = document.getElementById('coursesGrid');
    
    if (enrolledCourses.length === 0) {
        coursesGrid.innerHTML = `
            <div class="card">
                <div class="card-body text-center" style="padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
                    <h3>No Courses Enrolled</h3>
                    <p class="text-muted">You are not enrolled in any courses yet.</p>
                </div>
            </div>
        `;
        return;
    }
    
    coursesGrid.innerHTML = enrolledCourses.map(course => {
        // Get attendance for this course
        const attendanceStats = AttendanceManager.calculateAttendancePercentage(student.id, course.id);
        const attendanceClass = getAttendanceClass(attendanceStats.percentage);
        
        // Get result for this course
        const result = ResultsManager.getStudentCourseResult(student.id, course.id);
        const grade = result ? result.grade : '-';
        const gradeClass = result ? ResultsManager.getGradeClass(result.grade) : '';
        
        return `
            <div class="card">
                <div class="card-header" style="background: linear-gradient(135deg, var(--primary-color), var(--primary-light)); color: white;">
                    <h3 style="color: white; font-size: 18px;">${course.code}</h3>
                    <span class="badge" style="background: rgba(255,255,255,0.2); color: white;">${course.credits} Credits</span>
                </div>
                <div class="card-body">
                    <h4 style="margin-bottom: 8px; font-size: 16px;">${UIManager.escapeHTML(course.name)}</h4>
                    <p class="text-sm text-muted" style="margin-bottom: 16px;">
                        Instructor: ${UIManager.escapeHTML(course.teacherName)}
                    </p>
                    
                    <div class="flex justify-between mb-4">
                        <div>
                            <div class="text-muted text-sm">Attendance</div>
                            <div style="font-size: 20px; font-weight: 600;" class="${attendanceClass}">
                                ${attendanceStats.percentage}%
                            </div>
                        </div>
                        <div>
                            <div class="text-muted text-sm">Present</div>
                            <div style="font-size: 20px; font-weight: 600;">
                                ${attendanceStats.present}/${attendanceStats.total}
                            </div>
                        </div>
                        <div>
                            <div class="text-muted text-sm">Grade</div>
                            <div>
                                ${grade !== '-' ? `<span class="grade-badge ${gradeClass}">${grade}</span>` : '<span style="font-size: 20px;">-</span>'}
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <div class="text-sm text-muted mb-2">Attendance Progress</div>
                        ${UIManager.createProgressBar(attendanceStats.percentage, 'auto')}
                    </div>
                    
                    <div class="flex gap-2">
                        <a href="attendance.html?course=${course.id}" class="btn btn-outline btn-sm" style="flex: 1;">
                            📋 Attendance
                        </a>
                        <a href="results.html?course=${course.id}" class="btn btn-primary btn-sm" style="flex: 1;">
                            📝 Results
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Load recent results
 */
function loadRecentResults() {
    const user = AuthManager.getCurrentUser();
    const results = ResultsManager.getStudentResults(user.userId);
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    
    const tbody = document.getElementById('recentResultsBody');
    
    if (results.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 40px;">
                    <div class="text-muted">No results available yet</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = results.map(result => {
        const course = courses.find(c => c.id === result.courseId);
        const percentage = ResultsManager.getPercentage(result.totalMarks);
        const gradeClass = ResultsManager.getGradeClass(result.grade);
        const passed = result.grade !== 'F';
        
        return `
            <tr>
                <td>
                    <div style="font-weight: 500;">${course ? course.code : 'Unknown'}</div>
                    <div class="text-sm text-muted">${course ? course.name : ''}</div>
                </td>
                <td><strong>${result.totalMarks}</strong> / 220</td>
                <td>
                    <div class="flex items-center gap-2">
                        <span>${percentage}%</span>
                        <div style="width: 60px;">
                            ${UIManager.createProgressBar(percentage, 'auto')}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="grade-badge ${gradeClass}">${result.grade}</span>
                </td>
                <td>
                    <span class="badge ${passed ? 'badge-success' : 'badge-danger'}">
                        ${passed ? '✓ Passed' : '✕ Failed'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Get attendance class based on percentage
 */
function getAttendanceClass(percentage) {
    if (percentage >= 75) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-danger';
}

// Add text color styles
const style = document.createElement('style');
style.textContent = `
    .text-success { color: var(--accent-success); }
    .text-warning { color: var(--accent-warning); }
    .text-danger { color: var(--accent-danger); }
`;
document.head.appendChild(style);
