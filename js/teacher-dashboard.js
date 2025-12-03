/* =============================================
   TEACHER DASHBOARD CONTROLLER
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    // Protect page - only teacher can access
    if (!AuthManager.protectPage('teacher')) {
        return;
    }

    // Initialize dashboard
    initDashboard();
    loadTeacherInfo();
    loadDashboardStats();
    loadCourses();
    loadRecentActivity();
});

/**
 * Initialize dashboard UI components
 */
function initDashboard() {
    UIManager.initDashboard();
    UIManager.setActiveNav('dashboard');
    
    // Set current date
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

/**
 * Load teacher information
 */
function loadTeacherInfo() {
    const user = AuthManager.getCurrentUser();
    const teachers = StorageManager.get(StorageManager.KEYS.TEACHERS) || [];
    const teacher = teachers.find(t => t.id === user.userId);
    
    // Update welcome message
    const nameEl = document.getElementById('teacherName');
    if (nameEl && teacher) {
        nameEl.textContent = teacher.name.split(' ')[0]; // First name only
    }
    
    // Update sidebar course list
    loadSidebarCourses(teacher);
}

/**
 * Load sidebar courses
 */
function loadSidebarCourses(teacher) {
    const coursesList = document.getElementById('coursesList');
    if (!coursesList || !teacher) return;
    
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    const teacherCourses = courses.filter(c => c.teacherId === teacher.id);
    
    coursesList.innerHTML = teacherCourses.map(course => `
        <a href="attendance.html?course=${course.id}" class="nav-link" data-page="course-${course.id}">
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
    const teachers = StorageManager.get(StorageManager.KEYS.TEACHERS) || [];
    const teacher = teachers.find(t => t.id === user.userId);
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const results = StorageManager.get(StorageManager.KEYS.RESULTS) || [];
    
    if (!teacher) return;
    
    // Get teacher's courses
    const teacherCourses = courses.filter(c => c.teacherId === teacher.id);
    const courseIds = teacherCourses.map(c => c.id);
    
    // Count enrolled students
    let enrolledStudents = new Set();
    students.forEach(student => {
        student.enrolledCourses.forEach(courseId => {
            if (courseIds.includes(courseId)) {
                enrolledStudents.add(student.id);
            }
        });
    });
    
    // Calculate average attendance
    let totalAttendance = 0;
    let attendanceCount = 0;
    
    teacherCourses.forEach(course => {
        const summary = AttendanceManager.getCourseAttendanceSummary(course.id);
        if (summary.averageAttendance > 0) {
            totalAttendance += summary.averageAttendance;
            attendanceCount++;
        }
    });
    
    const avgAttendance = attendanceCount > 0 ? Math.round(totalAttendance / attendanceCount) : 0;
    
    // Count results uploaded
    const teacherResults = results.filter(r => courseIds.includes(r.courseId));
    
    // Update stat cards
    document.getElementById('totalCourses').textContent = teacherCourses.length;
    document.getElementById('totalStudents').textContent = enrolledStudents.size;
    document.getElementById('avgAttendance').textContent = avgAttendance + '%';
    document.getElementById('resultsUploaded').textContent = teacherResults.length;
}

/**
 * Load courses grid
 */
function loadCourses() {
    const user = AuthManager.getCurrentUser();
    const teachers = StorageManager.get(StorageManager.KEYS.TEACHERS) || [];
    const teacher = teachers.find(t => t.id === user.userId);
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    
    if (!teacher) return;
    
    const teacherCourses = courses.filter(c => c.teacherId === teacher.id);
    const coursesGrid = document.getElementById('coursesGrid');
    
    if (teacherCourses.length === 0) {
        coursesGrid.innerHTML = `
            <div class="card">
                <div class="card-body text-center" style="padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
                    <h3>No Courses Assigned</h3>
                    <p class="text-muted">You don't have any courses assigned yet.</p>
                </div>
            </div>
        `;
        return;
    }
    
    coursesGrid.innerHTML = teacherCourses.map(course => {
        // Count enrolled students
        const enrolledCount = students.filter(s => s.enrolledCourses.includes(course.id)).length;
        const summary = AttendanceManager.getCourseAttendanceSummary(course.id);
        const stats = ResultsManager.getCourseStatistics(course.id);
        
        return `
            <div class="card">
                <div class="card-header" style="background: linear-gradient(135deg, var(--primary-color), var(--primary-light)); color: white;">
                    <h3 style="color: white; font-size: 18px;">${course.code}</h3>
                    <span class="badge" style="background: rgba(255,255,255,0.2); color: white;">${course.credits} Credits</span>
                </div>
                <div class="card-body">
                    <h4 style="margin-bottom: 16px; font-size: 16px;">${UIManager.escapeHTML(course.name)}</h4>
                    
                    <div class="flex justify-between mb-4">
                        <div>
                            <div class="text-muted text-sm">Students</div>
                            <div style="font-size: 20px; font-weight: 600;">${enrolledCount}</div>
                        </div>
                        <div>
                            <div class="text-muted text-sm">Attendance</div>
                            <div style="font-size: 20px; font-weight: 600;">${summary.averageAttendance}%</div>
                        </div>
                        <div>
                            <div class="text-muted text-sm">Pass Rate</div>
                            <div style="font-size: 20px; font-weight: 600;">${stats.passRate || 0}%</div>
                        </div>
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
 * Load recent attendance activity
 */
function loadRecentActivity() {
    const user = AuthManager.getCurrentUser();
    const teachers = StorageManager.get(StorageManager.KEYS.TEACHERS) || [];
    const teacher = teachers.find(t => t.id === user.userId);
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    const attendance = StorageManager.get(StorageManager.KEYS.ATTENDANCE) || [];
    
    if (!teacher) return;
    
    const teacherCourses = courses.filter(c => c.teacherId === teacher.id);
    const courseIds = teacherCourses.map(c => c.id);
    const courseMap = Object.fromEntries(teacherCourses.map(c => [c.id, c]));
    
    // Get attendance for teacher's courses
    const teacherAttendance = attendance.filter(a => courseIds.includes(a.courseId));
    
    // Group by date and course
    const grouped = {};
    teacherAttendance.forEach(record => {
        const key = `${record.date}_${record.courseId}`;
        if (!grouped[key]) {
            grouped[key] = {
                date: record.date,
                courseId: record.courseId,
                present: 0,
                absent: 0
            };
        }
        if (record.status === 'present') {
            grouped[key].present++;
        } else {
            grouped[key].absent++;
        }
    });
    
    // Convert to array and sort by date
    const activityList = Object.values(grouped)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    
    const tbody = document.getElementById('recentActivityBody');
    
    if (activityList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 40px;">
                    <div class="text-muted">No attendance records yet</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = activityList.map(activity => {
        const course = courseMap[activity.courseId];
        const total = activity.present + activity.absent;
        const rate = total > 0 ? Math.round((activity.present / total) * 100) : 0;
        const rateClass = rate >= 75 ? 'badge-success' : rate >= 50 ? 'badge-warning' : 'badge-danger';
        
        return `
            <tr>
                <td>${UIManager.formatDate(activity.date)}</td>
                <td>
                    <span style="font-weight: 500;">${course ? course.code : 'Unknown'}</span>
                    <div class="text-sm text-muted">${course ? course.name : ''}</div>
                </td>
                <td><span class="badge badge-success">${activity.present}</span></td>
                <td><span class="badge badge-danger">${activity.absent}</span></td>
                <td>
                    <div class="flex items-center gap-2">
                        <span class="badge ${rateClass}">${rate}%</span>
                        <div style="width: 60px;">
                            ${UIManager.createProgressBar(rate, 'auto')}
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}
