/* =============================================
   STUDENT ATTENDANCE VIEW CONTROLLER
   ============================================= */

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    // Protect page - only student can access
    if (!AuthManager.protectPage('student')) {
        return;
    }

    // Initialize
    initDashboard();
    loadCourseFilter();
    loadOverallStats();
    loadCourseAttendance();
    loadAttendanceRecords();
    initEventListeners();
    
    // Check URL params for course filter
    const urlParams = new URLSearchParams(window.location.search);
    const courseParam = urlParams.get('course');
    if (courseParam) {
        document.getElementById('courseFilter').value = courseParam;
        currentFilter = courseParam;
        loadAttendanceRecords();
    }
});

/**
 * Initialize dashboard UI
 */
function initDashboard() {
    UIManager.initDashboard();
    UIManager.setActiveNav('attendance');
}

/**
 * Load course filter options
 */
function loadCourseFilter() {
    const user = AuthManager.getCurrentUser();
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const student = students.find(s => s.id === user.userId);
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    
    if (!student) return;
    
    const select = document.getElementById('courseFilter');
    const enrolledCourses = courses.filter(c => student.enrolledCourses.includes(c.id));
    
    enrolledCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = `${course.code} - ${course.name}`;
        select.appendChild(option);
    });
}

/**
 * Load overall attendance statistics
 */
function loadOverallStats() {
    const user = AuthManager.getCurrentUser();
    const stats = AttendanceManager.getOverallAttendance(user.userId);
    
    document.getElementById('overallPercentage').textContent = stats.percentage + '%';
    document.getElementById('totalClasses').textContent = stats.total;
    document.getElementById('classesAttended').textContent = stats.present;
    document.getElementById('classesMissed').textContent = stats.absent;
    
    // Update status
    const statusEl = document.getElementById('overallStatus');
    if (stats.percentage >= 75) {
        statusEl.className = 'stat-change positive';
        statusEl.innerHTML = '<span>✓ Good standing</span>';
    } else if (stats.percentage >= 50) {
        statusEl.className = 'stat-change';
        statusEl.innerHTML = '<span>⚠ Needs improvement</span>';
    } else {
        statusEl.className = 'stat-change negative';
        statusEl.innerHTML = '<span>⚠ At risk</span>';
    }
}

/**
 * Load course-wise attendance
 */
function loadCourseAttendance() {
    const user = AuthManager.getCurrentUser();
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const student = students.find(s => s.id === user.userId);
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    
    if (!student) return;
    
    const enrolledCourses = courses.filter(c => student.enrolledCourses.includes(c.id));
    const grid = document.getElementById('courseAttendanceGrid');
    
    if (enrolledCourses.length === 0) {
        grid.innerHTML = `
            <div class="card">
                <div class="card-body text-center" style="padding: 40px;">
                    <div class="text-muted">No courses enrolled</div>
                </div>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = enrolledCourses.map(course => {
        const stats = AttendanceManager.calculateAttendancePercentage(user.userId, course.id);
        const statusClass = getStatusClass(stats.percentage);
        const statusText = getStatusText(stats.percentage);
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3>${course.code}</h3>
                    <span class="badge ${statusClass}">${statusText}</span>
                </div>
                <div class="card-body">
                    <h4 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">
                        ${UIManager.escapeHTML(course.name)}
                    </h4>
                    
                    <div class="text-center mb-4">
                        <div style="font-size: 48px; font-weight: 700; color: var(--${getColor(stats.percentage)});">
                            ${stats.percentage}%
                        </div>
                        <div class="text-muted">Attendance Rate</div>
                    </div>
                    
                    ${UIManager.createProgressBar(stats.percentage, 'auto')}
                    
                    <div class="flex justify-between mt-4" style="font-size: 14px;">
                        <div class="text-center">
                            <div style="font-weight: 600; color: var(--accent-success);">${stats.present}</div>
                            <div class="text-muted">Present</div>
                        </div>
                        <div class="text-center">
                            <div style="font-weight: 600; color: var(--accent-danger);">${stats.absent}</div>
                            <div class="text-muted">Absent</div>
                        </div>
                        <div class="text-center">
                            <div style="font-weight: 600;">${stats.total}</div>
                            <div class="text-muted">Total</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Load detailed attendance records
 */
function loadAttendanceRecords() {
    const user = AuthManager.getCurrentUser();
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    let records = AttendanceManager.getStudentAttendance(user.userId);
    
    // Apply filter
    if (currentFilter !== 'all') {
        records = records.filter(r => r.courseId === currentFilter);
    }
    
    // Sort by date descending
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tbody = document.getElementById('attendanceRecordsBody');
    
    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center" style="padding: 40px;">
                    <div class="text-muted">No attendance records found</div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Show last 30 records
    const displayRecords = records.slice(0, 30);
    
    tbody.innerHTML = displayRecords.map(record => {
        const course = courses.find(c => c.id === record.courseId);
        const statusClass = record.status === 'present' ? 'badge-success' : 'badge-danger';
        const statusIcon = record.status === 'present' ? '✓' : '✕';
        
        return `
            <tr>
                <td>${UIManager.formatDate(record.date)}</td>
                <td>
                    <div style="font-weight: 500;">${course ? course.code : 'Unknown'}</div>
                    <div class="text-sm text-muted">${course ? course.name : ''}</div>
                </td>
                <td>
                    <span class="badge ${statusClass}">
                        ${statusIcon} ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    document.getElementById('courseFilter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        loadAttendanceRecords();
    });
}

/**
 * Get status class based on percentage
 */
function getStatusClass(percentage) {
    if (percentage >= 75) return 'badge-success';
    if (percentage >= 50) return 'badge-warning';
    return 'badge-danger';
}

/**
 * Get status text based on percentage
 */
function getStatusText(percentage) {
    if (percentage >= 75) return 'Good';
    if (percentage >= 50) return 'Warning';
    return 'At Risk';
}

/**
 * Get color based on percentage
 */
function getColor(percentage) {
    if (percentage >= 75) return 'accent-success';
    if (percentage >= 50) return 'accent-warning';
    return 'accent-danger';
}
