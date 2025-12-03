/* =============================================
   TEACHER RESULTS CONTROLLER
   ============================================= */

let currentCourse = null;

document.addEventListener('DOMContentLoaded', function() {
    // Protect page - only teacher can access
    if (!AuthManager.protectPage('teacher')) {
        return;
    }

    // Initialize
    initDashboard();
    loadCourseOptions();
    initEventListeners();
    
    // Check URL params for pre-selected course
    const urlParams = new URLSearchParams(window.location.search);
    const courseParam = urlParams.get('course');
    if (courseParam) {
        document.getElementById('courseSelect').value = courseParam;
        loadResults();
    }
});

/**
 * Initialize dashboard UI components
 */
function initDashboard() {
    UIManager.initDashboard();
    UIManager.setActiveNav('results');
}

/**
 * Load course options
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
 * Initialize event listeners
 */
function initEventListeners() {
    // Load results button
    document.getElementById('loadResultsBtn').addEventListener('click', loadResults);
    
    // Modal events
    const modal = document.getElementById('editResultModal');
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Save result button
    document.getElementById('saveResultBtn').addEventListener('click', saveResult);
    
    // Auto-calculate on input change
    const inputs = ['editQuiz1', 'editQuiz2', 'editAssignment', 'editMidterm', 'editFinal'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculateLiveTotal);
    });
}

/**
 * Load results for selected course
 */
function loadResults() {
    const courseId = document.getElementById('courseSelect').value;
    
    if (!courseId) {
        UIManager.showToast('Please select a course', 'warning');
        return;
    }
    
    currentCourse = courseId;
    
    const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const course = courses.find(c => c.id === courseId);
    
    // Get enrolled students
    const enrolledStudents = students.filter(s => s.enrolledCourses.includes(courseId));
    
    if (enrolledStudents.length === 0) {
        UIManager.showToast('No students enrolled in this course', 'warning');
        return;
    }
    
    // Update title
    document.getElementById('resultsTableTitle').textContent = 
        `${course.code} - ${course.name} Results`;
    
    // Render results table
    renderResultsTable(enrolledStudents);
    
    // Update statistics
    updateStatistics();
    
    // Show results section
    document.getElementById('resultsSection').classList.remove('hidden');
}

/**
 * Render results table
 */
function renderResultsTable(students) {
    const tbody = document.getElementById('resultsTableBody');
    
    tbody.innerHTML = students.map(student => {
        const result = ResultsManager.getStudentCourseResult(student.id, currentCourse);
        
        const quiz1 = result ? result.quiz1 : '-';
        const quiz2 = result ? result.quiz2 : '-';
        const assignment = result ? result.assignment : '-';
        const midterm = result ? result.midterm : '-';
        const final = result ? result.final : '-';
        const total = result ? result.totalMarks : '-';
        const grade = result ? result.grade : '-';
        const gradeClass = result ? ResultsManager.getGradeClass(result.grade) : '';
        
        return `
            <tr>
                <td>
                    <div class="flex items-center gap-3">
                        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 11px;">
                            ${AuthManager.getInitials(student.name)}
                        </div>
                        <div>
                            <div style="font-weight: 500;">${UIManager.escapeHTML(student.name)}</div>
                            <div class="text-xs text-muted">${student.id}</div>
                        </div>
                    </div>
                </td>
                <td class="text-center">${quiz1}</td>
                <td class="text-center">${quiz2}</td>
                <td class="text-center">${assignment}</td>
                <td class="text-center">${midterm}</td>
                <td class="text-center">${final}</td>
                <td class="text-center"><strong>${total}</strong></td>
                <td class="text-center">
                    ${grade !== '-' ? `<span class="grade-badge ${gradeClass}">${grade}</span>` : '-'}
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="openEditModal('${student.id}', '${UIManager.escapeHTML(student.name)}')">
                        ✏️ Edit
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Update course statistics
 */
function updateStatistics() {
    const stats = ResultsManager.getCourseStatistics(currentCourse);
    const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
    const enrolled = students.filter(s => s.enrolledCourses.includes(currentCourse)).length;
    
    document.getElementById('statTotalStudents').textContent = enrolled;
    document.getElementById('statAverage').textContent = stats.averageMarks || '-';
    document.getElementById('statHighest').textContent = stats.highestMarks || '-';
    document.getElementById('statPassRate').textContent = (stats.passRate || 0) + '%';
}

/**
 * Open edit modal for a student
 */
function openEditModal(studentId, studentName) {
    const modal = document.getElementById('editResultModal');
    const result = ResultsManager.getStudentCourseResult(studentId, currentCourse);
    
    // Set student info
    document.getElementById('modalStudentName').textContent = studentName;
    document.getElementById('editStudentId').value = studentId;
    
    // Fill form with existing data or defaults
    document.getElementById('editQuiz1').value = result ? result.quiz1 : 0;
    document.getElementById('editQuiz2').value = result ? result.quiz2 : 0;
    document.getElementById('editAssignment').value = result ? result.assignment : 0;
    document.getElementById('editMidterm').value = result ? result.midterm : 0;
    document.getElementById('editFinal').value = result ? result.final : 0;
    
    // Calculate initial total
    calculateLiveTotal();
    
    // Show modal
    modal.classList.add('active');
}

/**
 * Close edit modal
 */
function closeModal() {
    document.getElementById('editResultModal').classList.remove('active');
}

/**
 * Calculate live total while editing
 */
function calculateLiveTotal() {
    const quiz1 = parseInt(document.getElementById('editQuiz1').value) || 0;
    const quiz2 = parseInt(document.getElementById('editQuiz2').value) || 0;
    const assignment = parseInt(document.getElementById('editAssignment').value) || 0;
    const midterm = parseInt(document.getElementById('editMidterm').value) || 0;
    const final = parseInt(document.getElementById('editFinal').value) || 0;
    
    const total = quiz1 + quiz2 + assignment + midterm + final;
    const grade = ResultsManager.calculateGrade(total);
    const gradeClass = ResultsManager.getGradeClass(grade);
    
    document.getElementById('calculatedTotal').textContent = `${total} / 220`;
    
    const gradeEl = document.getElementById('calculatedGrade');
    gradeEl.textContent = grade;
    gradeEl.className = `grade-badge ${gradeClass}`;
}

/**
 * Save result
 */
function saveResult() {
    const form = document.getElementById('editResultForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const studentId = document.getElementById('editStudentId').value;
    const marks = {
        quiz1: parseInt(document.getElementById('editQuiz1').value) || 0,
        quiz2: parseInt(document.getElementById('editQuiz2').value) || 0,
        assignment: parseInt(document.getElementById('editAssignment').value) || 0,
        midterm: parseInt(document.getElementById('editMidterm').value) || 0,
        final: parseInt(document.getElementById('editFinal').value) || 0
    };
    
    // Validate max marks
    if (marks.quiz1 > 20 || marks.quiz2 > 20 || marks.assignment > 30 || 
        marks.midterm > 50 || marks.final > 100) {
        UIManager.showToast('Marks exceed maximum allowed values', 'error');
        return;
    }
    
    // Save result
    const result = ResultsManager.saveResult(currentCourse, studentId, marks);
    
    if (result.success) {
        UIManager.showToast('Result saved successfully!', 'success');
        closeModal();
        loadResults(); // Refresh table
    } else {
        UIManager.showToast('Failed to save result', 'error');
    }
}

// Add text-center style
const style = document.createElement('style');
style.textContent = `
    .text-center { text-align: center; }
    table input {
        width: 60px;
        padding: 4px 8px;
        text-align: center;
    }
`;
document.head.appendChild(style);
