/* =============================================
   RESULTS MANAGEMENT MODULE
   ============================================= */

/**
 * ResultsManager - Handles all result/grade operations
 */
const ResultsManager = {
    // Grade boundaries
    GRADE_BOUNDARIES: {
        A_PLUS: 90,  // 90-100 = A+
        A: 85,       // 85-89 = A
        A_MINUS: 80, // 80-84 = A-
        B_PLUS: 75,  // 75-79 = B+
        B: 70,       // 70-74 = B
        B_MINUS: 65, // 65-69 = B-
        C_PLUS: 60,  // 60-64 = C+
        C: 55,       // 55-59 = C
        C_MINUS: 50, // 50-54 = C-
        D: 45,       // 45-49 = D
        F: 0         // 0-44 = F
    },

    // Maximum marks for each component
    MAX_MARKS: {
        quiz1: 20,
        quiz2: 20,
        midterm: 50,
        final: 100,
        assignment: 30,
        total: 220
    },

    /**
     * Calculate grade based on percentage
     * @param {number} totalMarks - Total marks obtained
     * @returns {string} Grade
     */
    calculateGrade: function(totalMarks) {
        const percentage = (totalMarks / this.MAX_MARKS.total) * 100;
        
        if (percentage >= this.GRADE_BOUNDARIES.A_PLUS) return 'A+';
        if (percentage >= this.GRADE_BOUNDARIES.A) return 'A';
        if (percentage >= this.GRADE_BOUNDARIES.A_MINUS) return 'A-';
        if (percentage >= this.GRADE_BOUNDARIES.B_PLUS) return 'B+';
        if (percentage >= this.GRADE_BOUNDARIES.B) return 'B';
        if (percentage >= this.GRADE_BOUNDARIES.B_MINUS) return 'B-';
        if (percentage >= this.GRADE_BOUNDARIES.C_PLUS) return 'C+';
        if (percentage >= this.GRADE_BOUNDARIES.C) return 'C';
        if (percentage >= this.GRADE_BOUNDARIES.C_MINUS) return 'C-';
        if (percentage >= this.GRADE_BOUNDARIES.D) return 'D';
        return 'F';
    },

    /**
     * Calculate total marks
     * @param {object} marks - Object containing all mark components
     * @returns {number} Total marks
     */
    calculateTotal: function(marks) {
        return (marks.quiz1 || 0) + 
               (marks.quiz2 || 0) + 
               (marks.midterm || 0) + 
               (marks.final || 0) + 
               (marks.assignment || 0);
    },

    /**
     * Add or update result for a student
     * @param {string} courseId - Course ID
     * @param {string} studentId - Student ID
     * @param {object} marks - Marks object
     * @returns {object} Result with success status
     */
    saveResult: function(courseId, studentId, marks) {
        const results = StorageManager.get(StorageManager.KEYS.RESULTS) || [];
        
        // Calculate total and grade
        const totalMarks = this.calculateTotal(marks);
        const grade = this.calculateGrade(totalMarks);
        
        const resultRecord = {
            id: `${courseId}_${studentId}`,
            courseId: courseId,
            studentId: studentId,
            quiz1: marks.quiz1 || 0,
            quiz2: marks.quiz2 || 0,
            midterm: marks.midterm || 0,
            final: marks.final || 0,
            assignment: marks.assignment || 0,
            totalMarks: totalMarks,
            grade: grade,
            updatedAt: new Date().toISOString()
        };

        // Check for existing record
        const existingIndex = results.findIndex(r => 
            r.courseId === courseId && r.studentId === studentId
        );

        if (existingIndex !== -1) {
            results[existingIndex] = resultRecord;
        } else {
            results.push(resultRecord);
        }

        StorageManager.set(StorageManager.KEYS.RESULTS, results);

        return {
            success: true,
            message: 'Results saved successfully',
            result: resultRecord
        };
    },

    /**
     * Get result for a specific student in a course
     * @param {string} studentId - Student ID
     * @param {string} courseId - Course ID
     * @returns {object|null} Result record or null
     */
    getStudentCourseResult: function(studentId, courseId) {
        const results = StorageManager.get(StorageManager.KEYS.RESULTS) || [];
        return results.find(r => r.studentId === studentId && r.courseId === courseId) || null;
    },

    /**
     * Get all results for a student
     * @param {string} studentId - Student ID
     * @returns {array} Array of result records
     */
    getStudentResults: function(studentId) {
        const results = StorageManager.get(StorageManager.KEYS.RESULTS) || [];
        return results.filter(r => r.studentId === studentId);
    },

    /**
     * Get all results for a course
     * @param {string} courseId - Course ID
     * @returns {array} Array of result records
     */
    getCourseResults: function(courseId) {
        const results = StorageManager.get(StorageManager.KEYS.RESULTS) || [];
        return results.filter(r => r.courseId === courseId);
    },

    /**
     * Get detailed results with student info
     * @param {string} courseId - Course ID
     * @returns {array} Results with student details
     */
    getCourseResultsDetailed: function(courseId) {
        const results = this.getCourseResults(courseId);
        const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
        
        return results.map(result => {
            const student = students.find(s => s.id === result.studentId);
            return {
                ...result,
                studentName: student ? student.name : 'Unknown',
                studentEmail: student ? student.email : ''
            };
        });
    },

    /**
     * Get course statistics
     * @param {string} courseId - Course ID
     * @returns {object} Statistics for the course
     */
    getCourseStatistics: function(courseId) {
        const results = this.getCourseResults(courseId);
        
        if (results.length === 0) {
            return {
                totalStudents: 0,
                averageMarks: 0,
                highestMarks: 0,
                lowestMarks: 0,
                gradeDistribution: {}
            };
        }

        const marks = results.map(r => r.totalMarks);
        const grades = results.map(r => r.grade);
        
        // Calculate grade distribution
        const gradeDistribution = {};
        grades.forEach(grade => {
            gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
        });

        return {
            totalStudents: results.length,
            averageMarks: Math.round(marks.reduce((a, b) => a + b, 0) / marks.length),
            highestMarks: Math.max(...marks),
            lowestMarks: Math.min(...marks),
            gradeDistribution: gradeDistribution,
            passRate: Math.round((results.filter(r => r.grade !== 'F').length / results.length) * 100)
        };
    },

    /**
     * Get overall GPA for a student
     * @param {string} studentId - Student ID
     * @returns {object} GPA information
     */
    getStudentGPA: function(studentId) {
        const results = this.getStudentResults(studentId);
        const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
        
        if (results.length === 0) {
            return { gpa: 0, totalCredits: 0 };
        }

        // GPA points mapping
        const gradePoints = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D': 1.0, 'F': 0.0
        };

        let totalPoints = 0;
        let totalCredits = 0;

        results.forEach(result => {
            const course = courses.find(c => c.id === result.courseId);
            if (course) {
                const credits = course.credits || 3;
                const points = gradePoints[result.grade] || 0;
                totalPoints += points * credits;
                totalCredits += credits;
            }
        });

        return {
            gpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0,
            totalCredits: totalCredits
        };
    },

    /**
     * Get student rank in a course
     * @param {string} studentId - Student ID
     * @param {string} courseId - Course ID
     * @returns {object} Rank information
     */
    getStudentRank: function(studentId, courseId) {
        const results = this.getCourseResults(courseId);
        
        // Sort by total marks descending
        const sorted = [...results].sort((a, b) => b.totalMarks - a.totalMarks);
        
        const studentIndex = sorted.findIndex(r => r.studentId === studentId);
        
        return {
            rank: studentIndex !== -1 ? studentIndex + 1 : null,
            totalStudents: results.length
        };
    },

    /**
     * Delete result for a student
     * @param {string} courseId - Course ID
     * @param {string} studentId - Student ID
     * @returns {object} Result with success status
     */
    deleteResult: function(courseId, studentId) {
        const results = StorageManager.get(StorageManager.KEYS.RESULTS) || [];
        const filteredResults = results.filter(r => 
            !(r.courseId === courseId && r.studentId === studentId)
        );
        
        StorageManager.set(StorageManager.KEYS.RESULTS, filteredResults);
        
        return { success: true, message: 'Result deleted successfully' };
    },

    /**
     * Get percentage from total marks
     * @param {number} totalMarks - Total marks obtained
     * @returns {number} Percentage
     */
    getPercentage: function(totalMarks) {
        return Math.round((totalMarks / this.MAX_MARKS.total) * 100);
    },

    /**
     * Get grade class for styling
     * @param {string} grade - Grade letter
     * @returns {string} CSS class
     */
    getGradeClass: function(grade) {
        if (grade.startsWith('A')) return 'grade-a';
        if (grade.startsWith('B')) return 'grade-b';
        if (grade.startsWith('C')) return 'grade-c';
        if (grade === 'D') return 'grade-d';
        return 'grade-f';
    }
};
