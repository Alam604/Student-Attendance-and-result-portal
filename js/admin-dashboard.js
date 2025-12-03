/* =============================================
   ADMIN DASHBOARD CONTROLLER
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    // Protect page - only admin can access
    if (!AuthManager.protectPage('admin')) {
        return;
    }

    // Initialize dashboard
    initDashboard();
    loadDashboardStats();
    loadStudentsTable();
    loadAtRiskStudents();
    initEventListeners();
});

/**
 * Initialize dashboard UI components
 */
function initDashboard() {
    UIManager.initDashboard();
    UIManager.setActiveNav('dashboard');
}

/**
 * Load dashboard statistics
 */
function loadDashboardStats() {
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const teachers = StorageManager.get(StorageManager.KEYS.TEACHERS) || [];
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    
    // Update stat cards
    document.getElementById('totalStudents').textContent = students.length;
    document.getElementById('totalTeachers').textContent = teachers.length;
    document.getElementById('totalCourses').textContent = courses.length;
    
    // Calculate average attendance
    let totalAttendance = 0;
    let studentCount = 0;
    
    students.forEach(student => {
        const stats = AttendanceManager.getOverallAttendance(student.id);
        if (stats.total > 0) {
            totalAttendance += stats.percentage;
            studentCount++;
        }
    });
    
    const avgAttendance = studentCount > 0 ? Math.round(totalAttendance / studentCount) : 0;
    document.getElementById('avgAttendance').textContent = avgAttendance + '%';
    
    // Update attendance change indicator
    const attendanceChange = document.getElementById('attendanceChange');
    if (avgAttendance >= 75) {
        attendanceChange.className = 'stat-change positive';
    } else if (avgAttendance >= 50) {
        attendanceChange.className = 'stat-change';
    } else {
        attendanceChange.className = 'stat-change negative';
    }
}

/**
 * Load students table
 */
function loadStudentsTable(searchTerm = '') {
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const tbody = document.getElementById('studentsTableBody');
    
    // Filter students by search term
    let filteredStudents = students;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredStudents = students.filter(s => 
            s.name.toLowerCase().includes(term) ||
            s.id.toLowerCase().includes(term) ||
            s.department.toLowerCase().includes(term)
        );
    }
    
    if (filteredStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="padding: 40px;">
                    <div class="empty-state">
                        <div class="icon">👨‍🎓</div>
                        <h3>No students found</h3>
                        <p>Try adjusting your search criteria</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredStudents.map(student => {
        const attendance = AttendanceManager.getOverallAttendance(student.id);
        const statusClass = getStatusBadgeClass(student.status);
        const attendanceClass = getAttendanceClass(attendance.percentage);
        
        return `
            <tr>
                <td>
                    <div class="flex items-center gap-3">
                        <div class="user-avatar" style="width: 36px; height: 36px; font-size: 12px;">
                            ${AuthManager.getInitials(student.name)}
                        </div>
                        <div>
                            <div style="font-weight: 500;">${UIManager.escapeHTML(student.name)}</div>
                            <div class="text-sm text-muted">${UIManager.escapeHTML(student.email)}</div>
                        </div>
                    </div>
                </td>
                <td><code>${student.id}</code></td>
                <td>${UIManager.escapeHTML(student.department)}</td>
                <td>${student.semester}</td>
                <td><span class="badge ${statusClass}">${student.status.replace('_', ' ')}</span></td>
                <td>
                    <div class="flex items-center gap-2">
                        <span class="${attendanceClass}">${attendance.percentage}%</span>
                        <div style="width: 60px;">
                            ${UIManager.createProgressBar(attendance.percentage, 'auto')}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="flex gap-1">
                        <button class="action-btn edit" onclick="editStudent('${student.id}')" title="Edit">
                            ✏️
                        </button>
                        <button class="action-btn delete" onclick="deleteStudent('${student.id}')" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Load students at risk (low attendance)
 */
function loadAtRiskStudents() {
    const atRiskStudents = AttendanceManager.getStudentsAtRisk(75);
    const tbody = document.getElementById('atRiskTableBody');
    
    if (atRiskStudents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 40px; color: var(--accent-success);">
                    ✓ All students have attendance above 75%
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = atRiskStudents.map(student => {
        const attendanceClass = getAttendanceClass(student.attendancePercentage);
        return `
            <tr>
                <td>
                    <div class="flex items-center gap-3">
                        <div class="user-avatar" style="width: 36px; height: 36px; font-size: 12px; background: linear-gradient(135deg, var(--accent-danger), #F87171);">
                            ${AuthManager.getInitials(student.name)}
                        </div>
                        <span style="font-weight: 500;">${UIManager.escapeHTML(student.name)}</span>
                    </div>
                </td>
                <td><code>${student.id}</code></td>
                <td>${UIManager.escapeHTML(student.department)}</td>
                <td>
                    <div class="flex items-center gap-2">
                        <span class="${attendanceClass}" style="font-weight: 600;">${student.attendancePercentage}%</span>
                        <div style="width: 80px;">
                            ${UIManager.createProgressBar(student.attendancePercentage, 'danger')}
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-danger">At Risk</span></td>
            </tr>
        `;
    }).join('');
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchStudents');
    if (searchInput) {
        searchInput.addEventListener('input', UIManager.debounce((e) => {
            loadStudentsTable(e.target.value);
        }, 300));
    }
    
    // Add student button
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', () => {
            openAddStudentModal();
        });
    }
    
    // Modal close buttons
    const modal = document.getElementById('addStudentModal');
    if (modal) {
        modal.querySelector('.modal-close').addEventListener('click', closeAddStudentModal);
        modal.querySelector('.modal-cancel').addEventListener('click', closeAddStudentModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAddStudentModal();
        });
    }
    
    // Save student button
    const saveStudentBtn = document.getElementById('saveStudentBtn');
    if (saveStudentBtn) {
        saveStudentBtn.addEventListener('click', saveNewStudent);
    }
}

/**
 * Open add student modal
 */
function openAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    modal.classList.add('active');
    document.getElementById('addStudentForm').reset();
}

/**
 * Close add student modal
 */
function closeAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    modal.classList.remove('active');
}

/**
 * Save new student
 */
function saveNewStudent() {
    const form = document.getElementById('addStudentForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const department = document.getElementById('studentDept').value;
    const semester = parseInt(document.getElementById('studentSemester').value);
    const password = document.getElementById('studentPassword').value;
    
    // Generate new student ID
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const newId = 'student' + String(students.length + 1).padStart(3, '0');
    
    // Create student record
    const newStudent = {
        id: newId,
        name: name,
        email: email,
        department: department,
        semester: semester,
        enrolledCourses: [],
        status: 'Enrolled',
        enrollmentDate: new Date().toISOString().split('T')[0]
    };
    
    // Add to students
    students.push(newStudent);
    StorageManager.set(StorageManager.KEYS.STUDENTS, students);
    
    // Add user credentials
    const users = StorageManager.get(StorageManager.KEYS.USERS) || [];
    users.push({
        id: newId,
        password: password,
        role: 'student',
        name: name
    });
    StorageManager.set(StorageManager.KEYS.USERS, users);
    
    // Close modal and refresh
    closeAddStudentModal();
    loadStudentsTable();
    loadDashboardStats();
    
    UIManager.showToast(`Student ${name} added successfully!`, 'success');
}

/**
 * Edit student (placeholder)
 */
function editStudent(studentId) {
    UIManager.showToast('Edit functionality coming soon', 'info');
}

/**
 * Delete student
 */
function deleteStudent(studentId) {
    UIManager.confirm('Are you sure you want to delete this student? This action cannot be undone.', () => {
        // Remove from students
        let students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
        students = students.filter(s => s.id !== studentId);
        StorageManager.set(StorageManager.KEYS.STUDENTS, students);
        
        // Remove from users
        let users = StorageManager.get(StorageManager.KEYS.USERS) || [];
        users = users.filter(u => u.id !== studentId);
        StorageManager.set(StorageManager.KEYS.USERS, users);
        
        // Refresh tables
        loadStudentsTable();
        loadDashboardStats();
        loadAtRiskStudents();
        
        UIManager.showToast('Student deleted successfully', 'success');
    });
}

/**
 * Get status badge class
 */
function getStatusBadgeClass(status) {
    switch(status) {
        case 'Enrolled': return 'badge-success';
        case 'On_Probation': return 'badge-warning';
        case 'Graduated': return 'badge-info';
        case 'Suspended': return 'badge-danger';
        default: return 'badge-primary';
    }
}

/**
 * Get attendance class based on percentage
 */
function getAttendanceClass(percentage) {
    if (percentage >= 75) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-danger';
}

// Add text color classes
const style = document.createElement('style');
style.textContent = `
    .text-success { color: var(--accent-success); }
    .text-warning { color: var(--accent-warning); }
    .text-danger { color: var(--accent-danger); }
    code {
        background-color: var(--bg-tertiary);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-family: 'Courier New', monospace;
    }
`;
document.head.appendChild(style);
