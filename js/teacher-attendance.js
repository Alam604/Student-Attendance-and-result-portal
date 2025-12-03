/* =============================================
   TEACHER ATTENDANCE CONTROLLER
   ============================================= */

// Current state
let currentCourse = null;
let currentDate = null;
let attendanceData = {};

document.addEventListener('DOMContentLoaded', function() {
    // Protect page - only teacher can access
    if (!AuthManager.protectPage('teacher')) {
        return;
    }

    // Initialize
    initDashboard();
    loadCourseOptions();
    setDefaultDate();
    loadPreviousRecords();
    initEventListeners();
    
    // Check URL params for pre-selected course
    const urlParams = new URLSearchParams(window.location.search);
    const courseParam = urlParams.get('course');
    if (courseParam) {
        document.getElementById('courseSelect').value = courseParam;
    }
});

/**
 * Initialize dashboard UI components
 */
function initDashboard() {
    UIManager.initDashboard();
    UIManager.setActiveNav('attendance');
}

/**
 * Load course options for select
 */
function loadCourseOptions() {
    const user = AuthManager.getCurrentUser();
    const teachers = StorageManager.get(StorageManager.KEYS.TEACHERS) || [];
    const teacher = teachers.find(t => t.id === user.userId);
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    
    if (!teacher) return;
    
    const teacherCourses = courses.filter(c => c.teacherId === teacher.id);
    const select = document.getElementById('courseSelect');
    
    teacherCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = `${course.code} - ${course.name}`;
        select.appendChild(option);
    });
}

/**
 * Set default date to today
 */
function setDefaultDate() {
    const dateInput = document.getElementById('dateSelect');
    dateInput.value = UIManager.formatDateForInput();
    dateInput.max = UIManager.formatDateForInput(); // Can't mark future dates
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Load students button
    document.getElementById('loadStudentsBtn').addEventListener('click', loadStudents);
    
    // Mark all buttons
    document.getElementById('markAllPresentBtn').addEventListener('click', () => markAll('present'));
    document.getElementById('markAllAbsentBtn').addEventListener('click', () => markAll('absent'));
    
    // Save attendance button
    document.getElementById('saveAttendanceBtn').addEventListener('click', saveAttendance);
}

/**
 * Load students for selected course and date
 */
function loadStudents() {
    const courseId = document.getElementById('courseSelect').value;
    const date = document.getElementById('dateSelect').value;
    
    if (!courseId) {
        UIManager.showToast('Please select a course', 'warning');
        return;
    }
    
    if (!date) {
        UIManager.showToast('Please select a date', 'warning');
        return;
    }
    
    currentCourse = courseId;
    currentDate = date;
    
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const course = courses.find(c => c.id === courseId);
    
    // Get enrolled students
    const enrolledStudents = students.filter(s => s.enrolledCourses.includes(courseId));
    
    if (enrolledStudents.length === 0) {
        UIManager.showToast('No students enrolled in this course', 'warning');
        return;
    }
    
    // Get existing attendance for this date
    const existingAttendance = AttendanceManager.getAttendanceByDate(courseId, date);
    const existingMap = Object.fromEntries(existingAttendance.map(a => [a.studentId, a.status]));
    
    // Initialize attendance data
    attendanceData = {};
    enrolledStudents.forEach(student => {
        attendanceData[student.id] = existingMap[student.id] || null;
    });
    
    // Update UI
    document.getElementById('selectedCourseTitle').textContent = `${course.code} - ${course.name}`;
    document.getElementById('selectedDate').textContent = UIManager.formatDate(date);
    
    // Render student cards
    renderStudentCards(enrolledStudents);
    
    // Show attendance section
    document.getElementById('attendanceSection').classList.remove('hidden');
    
    // Update summary
    updateSummary();
}

/**
 * Render student attendance cards
 */
function renderStudentCards(students) {
    const grid = document.getElementById('studentsGrid');
    
    grid.innerHTML = students.map(student => {
        const status = attendanceData[student.id];
        const presentActive = status === 'present' ? 'active' : '';
        const absentActive = status === 'absent' ? 'active' : '';
        
        return `
            <div class="student-attendance-card" data-student-id="${student.id}">
                <div class="student-avatar">
                    ${AuthManager.getInitials(student.name)}
                </div>
                <div class="student-info">
                    <div class="student-name">${UIManager.escapeHTML(student.name)}</div>
                    <div class="student-id">${student.id}</div>
                </div>
                <div class="attendance-toggle">
                    <button class="toggle-btn present ${presentActive}" 
                            onclick="toggleAttendance('${student.id}', 'present')">
                        ✓ P
                    </button>
                    <button class="toggle-btn absent ${absentActive}" 
                            onclick="toggleAttendance('${student.id}', 'absent')">
                        ✕ A
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Toggle attendance status for a student
 */
function toggleAttendance(studentId, status) {
    // Toggle off if clicking same status
    if (attendanceData[studentId] === status) {
        attendanceData[studentId] = null;
    } else {
        attendanceData[studentId] = status;
    }
    
    // Update button states
    const card = document.querySelector(`[data-student-id="${studentId}"]`);
    const presentBtn = card.querySelector('.toggle-btn.present');
    const absentBtn = card.querySelector('.toggle-btn.absent');
    
    presentBtn.classList.toggle('active', attendanceData[studentId] === 'present');
    absentBtn.classList.toggle('active', attendanceData[studentId] === 'absent');
    
    updateSummary();
}

/**
 * Mark all students
 */
function markAll(status) {
    Object.keys(attendanceData).forEach(studentId => {
        attendanceData[studentId] = status;
    });
    
    // Reload student cards to reflect changes
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const enrolledStudents = students.filter(s => attendanceData.hasOwnProperty(s.id));
    renderStudentCards(enrolledStudents);
    updateSummary();
    
    UIManager.showToast(`Marked all students as ${status}`, 'info');
}

/**
 * Update attendance summary
 */
function updateSummary() {
    const values = Object.values(attendanceData);
    const present = values.filter(v => v === 'present').length;
    const absent = values.filter(v => v === 'absent').length;
    
    document.getElementById('presentCount').textContent = `Present: ${present}`;
    document.getElementById('absentCount').textContent = `Absent: ${absent}`;
}

/**
 * Save attendance to storage
 */
function saveAttendance() {
    // Check if all students have been marked
    const unmarked = Object.values(attendanceData).filter(v => v === null).length;
    
    if (unmarked > 0) {
        UIManager.confirm(`${unmarked} student(s) are not marked. Continue saving?`, () => {
            performSave();
        });
    } else {
        performSave();
    }
}

/**
 * Perform the actual save operation
 */
function performSave() {
    const attendanceRecords = Object.entries(attendanceData)
        .filter(([_, status]) => status !== null)
        .map(([studentId, status]) => ({ studentId, status }));
    
    const result = AttendanceManager.markBulkAttendance(currentCourse, currentDate, attendanceRecords);
    
    if (result.success) {
        UIManager.showToast(result.message, 'success');
        loadPreviousRecords();
    } else {
        UIManager.showToast('Failed to save attendance', 'error');
    }
}

/**
 * Load previous attendance records
 */
function loadPreviousRecords() {
    const user = AuthManager.getCurrentUser();
    const teachers = StorageManager.get(StorageManager.KEYS.TEACHERS) || [];
    const teacher = teachers.find(t => t.id === user.userId);
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    const attendance = StorageManager.get(StorageManager.KEYS.ATTENDANCE) || [];
    
    if (!teacher) return;
    
    const teacherCourses = courses.filter(c => c.teacherId === teacher.id);
    const courseIds = teacherCourses.map(c => c.id);
    const courseMap = Object.fromEntries(teacherCourses.map(c => [c.id, c]));
    
    // Group attendance by date and course
    const grouped = {};
    attendance.filter(a => courseIds.includes(a.courseId)).forEach(record => {
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
    const records = Object.values(grouped)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 15);
    
    const tbody = document.getElementById('previousRecordsBody');
    
    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center" style="padding: 40px;">
                    <div class="text-muted">No attendance records yet</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = records.map(record => {
        const course = courseMap[record.courseId];
        const total = record.present + record.absent;
        const rate = total > 0 ? Math.round((record.present / total) * 100) : 0;
        const rateClass = rate >= 75 ? 'badge-success' : rate >= 50 ? 'badge-warning' : 'badge-danger';
        
        return `
            <tr>
                <td>${UIManager.formatDate(record.date)}</td>
                <td>
                    <span style="font-weight: 500;">${course ? course.code : 'Unknown'}</span>
                </td>
                <td><span class="badge badge-success">${record.present}</span></td>
                <td><span class="badge badge-danger">${record.absent}</span></td>
                <td>
                    <span class="badge ${rateClass}">${rate}%</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" 
                            onclick="editRecord('${record.courseId}', '${record.date}')">
                        ✏️ Edit
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Edit existing attendance record
 */
function editRecord(courseId, date) {
    document.getElementById('courseSelect').value = courseId;
    document.getElementById('dateSelect').value = date;
    loadStudents();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
