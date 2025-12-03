/**
 * Student Results Page Controller
 * Handles display of student's academic results and grades
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize common dashboard features
    UIManager.initDashboard();
    
    // Protect page and check authentication
    AuthManager.protectPage('student');
    
    // Initialize results page
    initResultsPage();
});

/**
 * Initialize results page
 */
function initResultsPage() {
    loadGPACard();
    loadStatsCards();
    loadDetailedResults();
}

/**
 * Load GPA card data
 */
function loadGPACard() {
    const currentUser = AuthManager.getCurrentUser();
    if (!currentUser) return;
    
    const gpaData = ResultsManager.getStudentGPA(currentUser.studentId);
    
    document.getElementById('gpaValue').textContent = gpaData.gpa.toFixed(2);
    document.getElementById('totalCredits').textContent = gpaData.totalCredits;
}

/**
 * Load statistics cards
 */
function loadStatsCards() {
    const currentUser = AuthManager.getCurrentUser();
    if (!currentUser) return;
    
    const results = ResultsManager.getStudentResults(currentUser.studentId);
    const courses = StorageManager.get('courses') || [];
    
    // Get unique courses with results
    const coursesWithResults = [...new Set(results.map(r => r.courseId))];
    
    // Calculate statistics
    let totalMarks = 0;
    let highestScore = 0;
    let coursesPassed = 0;
    let courseResults = [];
    
    coursesWithResults.forEach(courseId => {
        const courseResultsList = results.filter(r => r.courseId === courseId);
        if (courseResultsList.length > 0) {
            // Get the most recent result for this course
            const latestResult = courseResultsList.sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            )[0];
            
            const total = ResultsManager.calculateTotal(latestResult);
            const percentage = (total / 100) * 100; // Assuming max is 100
            
            courseResults.push({
                courseId,
                total,
                percentage,
                grade: latestResult.grade
            });
            
            totalMarks += total;
            if (total > highestScore) highestScore = total;
            if (latestResult.grade !== 'F') coursesPassed++;
        }
    });
    
    const averageMarks = courseResults.length > 0 
        ? Math.round(totalMarks / courseResults.length) 
        : 0;
    
    document.getElementById('coursesCompleted').textContent = coursesWithResults.length;
    document.getElementById('averageMarks').textContent = averageMarks + '%';
    document.getElementById('highestScore').textContent = highestScore + '%';
    document.getElementById('coursesPassed').textContent = coursesPassed;
}

/**
 * Load detailed results for each course
 */
function loadDetailedResults() {
    const currentUser = AuthManager.getCurrentUser();
    if (!currentUser) return;
    
    const container = document.getElementById('resultsContainer');
    const results = ResultsManager.getStudentResults(currentUser.studentId);
    const courses = StorageManager.get('courses') || [];
    const attendance = StorageManager.get('attendance') || [];
    
    // Group results by course
    const courseGroups = {};
    results.forEach(result => {
        if (!courseGroups[result.courseId]) {
            courseGroups[result.courseId] = [];
        }
        courseGroups[result.courseId].push(result);
    });
    
    if (Object.keys(courseGroups).length === 0) {
        container.innerHTML = `
            <div class="card">
                <div class="card-body" style="text-align: center; padding: 48px;">
                    <div style="font-size: 64px; margin-bottom: 16px;">📋</div>
                    <h3>No Results Available</h3>
                    <p style="color: var(--text-secondary);">Your results will appear here once they are published.</p>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    Object.entries(courseGroups).forEach(([courseId, courseResults]) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;
        
        // Get the most recent result
        const latestResult = courseResults.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        )[0];
        
        const total = ResultsManager.calculateTotal(latestResult);
        const gradeClass = getGradeClass(latestResult.grade);
        
        // Get attendance for this course
        const courseAttendance = attendance.filter(
            a => a.courseId === courseId && a.studentId === currentUser.studentId
        );
        const presentDays = courseAttendance.filter(a => a.status === 'present').length;
        const totalDays = courseAttendance.length;
        const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        
        html += `
            <div class="card mb-4">
                <div class="card-header" style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 style="margin: 0; font-size: 18px;">${UIManager.escapeHTML(course.name)}</h3>
                            <span style="color: var(--text-secondary); font-size: 14px;">
                                ${UIManager.escapeHTML(course.code)} • ${course.credits} Credits
                            </span>
                        </div>
                        <div class="badge ${gradeClass}" style="font-size: 24px; padding: 12px 24px;">
                            ${latestResult.grade}
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Marks Breakdown -->
                    <h4 style="margin-bottom: 16px; color: var(--text-secondary);">📊 Marks Breakdown</h4>
                    <div class="result-breakdown mb-4">
                        ${createMarkRow('Quiz', latestResult.quiz, ResultsManager.MAX_MARKS.quiz)}
                        ${createMarkRow('Assignment', latestResult.assignment, ResultsManager.MAX_MARKS.assignment)}
                        ${createMarkRow('Mid-Term', latestResult.midterm, ResultsManager.MAX_MARKS.midterm)}
                        ${createMarkRow('Final', latestResult.final, ResultsManager.MAX_MARKS.final)}
                    </div>
                    
                    <!-- Total Score -->
                    <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                        <div class="flex justify-between items-center">
                            <span style="font-weight: 600;">Total Score</span>
                            <span style="font-size: 24px; font-weight: 700; color: var(--primary);">
                                ${total}/100
                            </span>
                        </div>
                        <div class="progress-bar" style="margin-top: 8px;">
                            <div class="progress-fill ${total >= 80 ? 'success' : total >= 60 ? 'warning' : 'danger'}" 
                                 style="width: ${total}%">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Attendance Info -->
                    <div class="flex gap-4" style="flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 150px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="font-size: 12px; color: var(--text-secondary);">Attendance</div>
                            <div style="font-size: 18px; font-weight: 600;">${attendancePercent}%</div>
                        </div>
                        <div style="flex: 1; min-width: 150px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="font-size: 12px; color: var(--text-secondary);">Grade Points</div>
                            <div style="font-size: 18px; font-weight: 600;">${getGradePoints(latestResult.grade)}</div>
                        </div>
                        <div style="flex: 1; min-width: 150px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="font-size: 12px; color: var(--text-secondary);">Status</div>
                            <div style="font-size: 18px; font-weight: 600; color: ${latestResult.grade === 'F' ? 'var(--danger)' : 'var(--success)'};">
                                ${latestResult.grade === 'F' ? 'Failed' : 'Passed'}
                            </div>
                        </div>
                        <div style="flex: 1; min-width: 150px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="font-size: 12px; color: var(--text-secondary);">Published</div>
                            <div style="font-size: 18px; font-weight: 600;">${UIManager.formatDate(latestResult.date)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Create a mark row with progress bar
 */
function createMarkRow(label, obtained, max) {
    const percentage = (obtained / max) * 100;
    const color = percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'danger';
    
    return `
        <div class="mark-row" style="margin-bottom: 12px;">
            <div class="flex justify-between" style="margin-bottom: 4px;">
                <span style="font-weight: 500;">${label}</span>
                <span style="color: var(--text-secondary);">${obtained}/${max}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${color}" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

/**
 * Get grade badge class
 */
function getGradeClass(grade) {
    if (grade.startsWith('A')) return 'badge-success';
    if (grade.startsWith('B')) return 'badge-info';
    if (grade.startsWith('C')) return 'badge-warning';
    if (grade === 'D') return 'badge-warning';
    return 'badge-danger';
}

/**
 * Get grade points for GPA calculation
 */
function getGradePoints(grade) {
    const points = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D': 1.0, 'F': 0.0
    };
    return points[grade] || 0.0;
}
