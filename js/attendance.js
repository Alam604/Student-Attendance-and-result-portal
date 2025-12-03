/* =============================================
   ATTENDANCE MANAGEMENT MODULE
   ============================================= */

/**
 * AttendanceManager - Handles all attendance operations
 */
const AttendanceManager = {
    /**
     * Mark attendance for a student in a course
     * @param {string} courseId - Course ID
     * @param {string} studentId - Student ID
     * @param {string} date - Date (YYYY-MM-DD)
     * @param {string} status - 'present' or 'absent'
     * @returns {object} Result with success status
     */
    markAttendance: function(courseId, studentId, date, status) {
        const attendance = StorageManager.get(StorageManager.KEYS.ATTENDANCE) || [];
        const currentUser = AuthManager.getCurrentUser();
        
        // Check for existing record
        const existingIndex = attendance.findIndex(a => 
            a.courseId === courseId && 
            a.studentId === studentId && 
            a.date === date
        );

        const record = {
            id: `${courseId}_${studentId}_${date}`,
            courseId: courseId,
            studentId: studentId,
            date: date,
            status: status,
            markedBy: currentUser ? currentUser.userId : 'system',
            markedAt: new Date().toISOString()
        };

        if (existingIndex !== -1) {
            // Update existing record
            attendance[existingIndex] = record;
        } else {
            // Add new record
            attendance.push(record);
        }

        StorageManager.set(StorageManager.KEYS.ATTENDANCE, attendance);

        return { success: true, message: 'Attendance marked successfully' };
    },

    /**
     * Mark bulk attendance for multiple students
     * @param {string} courseId - Course ID
     * @param {string} date - Date (YYYY-MM-DD)
     * @param {array} attendanceData - Array of {studentId, status}
     * @returns {object} Result with success status
     */
    markBulkAttendance: function(courseId, date, attendanceData) {
        let successCount = 0;
        
        attendanceData.forEach(data => {
            const result = this.markAttendance(courseId, data.studentId, date, data.status);
            if (result.success) successCount++;
        });

        return {
            success: true,
            message: `Attendance marked for ${successCount} students`
        };
    },

    /**
     * Get attendance for a specific course on a specific date
     * @param {string} courseId - Course ID
     * @param {string} date - Date (YYYY-MM-DD)
     * @returns {array} Array of attendance records
     */
    getAttendanceByDate: function(courseId, date) {
        const attendance = StorageManager.get(StorageManager.KEYS.ATTENDANCE) || [];
        return attendance.filter(a => a.courseId === courseId && a.date === date);
    },

    /**
     * Get all attendance records for a student
     * @param {string} studentId - Student ID
     * @returns {array} Array of attendance records
     */
    getStudentAttendance: function(studentId) {
        const attendance = StorageManager.get(StorageManager.KEYS.ATTENDANCE) || [];
        return attendance.filter(a => a.studentId === studentId);
    },

    /**
     * Get attendance for a student in a specific course
     * @param {string} studentId - Student ID
     * @param {string} courseId - Course ID
     * @returns {array} Array of attendance records
     */
    getStudentCourseAttendance: function(studentId, courseId) {
        const attendance = StorageManager.get(StorageManager.KEYS.ATTENDANCE) || [];
        return attendance.filter(a => a.studentId === studentId && a.courseId === courseId);
    },

    /**
     * Calculate attendance percentage for a student in a course
     * @param {string} studentId - Student ID
     * @param {string} courseId - Course ID
     * @returns {object} Attendance statistics
     */
    calculateAttendancePercentage: function(studentId, courseId) {
        const records = this.getStudentCourseAttendance(studentId, courseId);
        
        if (records.length === 0) {
            return {
                total: 0,
                present: 0,
                absent: 0,
                percentage: 0
            };
        }

        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        const total = records.length;
        const percentage = Math.round((present / total) * 100);

        return {
            total: total,
            present: present,
            absent: absent,
            percentage: percentage
        };
    },

    /**
     * Get overall attendance percentage for a student across all courses
     * @param {string} studentId - Student ID
     * @returns {object} Overall attendance statistics
     */
    getOverallAttendance: function(studentId) {
        const records = this.getStudentAttendance(studentId);
        
        if (records.length === 0) {
            return {
                total: 0,
                present: 0,
                absent: 0,
                percentage: 0
            };
        }

        const present = records.filter(r => r.status === 'present').length;
        const absent = records.filter(r => r.status === 'absent').length;
        const total = records.length;
        const percentage = Math.round((present / total) * 100);

        return {
            total: total,
            present: present,
            absent: absent,
            percentage: percentage
        };
    },

    /**
     * Get course attendance summary for a teacher
     * @param {string} courseId - Course ID
     * @returns {object} Course attendance summary
     */
    getCourseAttendanceSummary: function(courseId) {
        const attendance = StorageManager.get(StorageManager.KEYS.ATTENDANCE) || [];
        const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
        const courses = StorageManager.get(StorageManager.KEYS.COURSES) || [];
        
        const course = courses.find(c => c.id === courseId);
        const enrolledStudents = students.filter(s => s.enrolledCourses.includes(courseId));
        
        const courseAttendance = attendance.filter(a => a.courseId === courseId);
        const uniqueDates = [...new Set(courseAttendance.map(a => a.date))];
        
        const studentSummaries = enrolledStudents.map(student => {
            const stats = this.calculateAttendancePercentage(student.id, courseId);
            return {
                studentId: student.id,
                studentName: student.name,
                ...stats
            };
        });

        const totalClasses = uniqueDates.length;
        const avgAttendance = studentSummaries.length > 0
            ? Math.round(studentSummaries.reduce((sum, s) => sum + s.percentage, 0) / studentSummaries.length)
            : 0;

        return {
            courseId: courseId,
            courseName: course ? course.name : 'Unknown',
            totalClasses: totalClasses,
            totalStudents: enrolledStudents.length,
            averageAttendance: avgAttendance,
            studentSummaries: studentSummaries
        };
    },

    /**
     * Get attendance records for a course
     * @param {string} courseId - Course ID
     * @returns {array} All attendance records for the course
     */
    getCourseAttendance: function(courseId) {
        const attendance = StorageManager.get(StorageManager.KEYS.ATTENDANCE) || [];
        return attendance.filter(a => a.courseId === courseId);
    },

    /**
     * Get recent attendance activity
     * @param {number} limit - Number of records to return
     * @returns {array} Recent attendance records
     */
    getRecentActivity: function(limit = 10) {
        const attendance = StorageManager.get(StorageManager.KEYS.ATTENDANCE) || [];
        return attendance
            .sort((a, b) => new Date(b.markedAt) - new Date(a.markedAt))
            .slice(0, limit);
    },

    /**
     * Get students at risk (low attendance)
     * @param {number} threshold - Attendance percentage threshold
     * @returns {array} Students below threshold
     */
    getStudentsAtRisk: function(threshold = 75) {
        const students = StorageManager.get(StorageManager.KEYS.STUDENTS) || [];
        const atRisk = [];

        students.forEach(student => {
            const stats = this.getOverallAttendance(student.id);
            if (stats.total > 0 && stats.percentage < threshold) {
                atRisk.push({
                    ...student,
                    attendancePercentage: stats.percentage
                });
            }
        });

        return atRisk.sort((a, b) => a.attendancePercentage - b.attendancePercentage);
    }
};
