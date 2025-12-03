/* =============================================
   STORAGE MANAGER MODULE
   Handles all Local Storage operations
   ============================================= */

/**
 * StorageManager - A utility class for managing browser's Local Storage
 * Implements the Data Tier of our 3-Tier Client-Side Architecture
 */
const StorageManager = {
    // Storage Keys
    KEYS: {
        USERS: 'portal_users',
        STUDENTS: 'portal_students',
        TEACHERS: 'portal_teachers',
        COURSES: 'portal_courses',
        ATTENDANCE: 'portal_attendance',
        RESULTS: 'portal_results',
        CURRENT_USER: 'portal_current_user',
        SETTINGS: 'portal_settings'
    },

    /**
     * Initialize storage with default data if empty
     */
    init: function() {
        // Initialize users if not exists
        if (!this.get(this.KEYS.USERS)) {
            this.set(this.KEYS.USERS, this.getDefaultUsers());
        }
        
        // Initialize students if not exists
        if (!this.get(this.KEYS.STUDENTS)) {
            this.set(this.KEYS.STUDENTS, this.getDefaultStudents());
        }
        
        // Initialize teachers if not exists
        if (!this.get(this.KEYS.TEACHERS)) {
            this.set(this.KEYS.TEACHERS, this.getDefaultTeachers());
        }
        
        // Initialize courses if not exists
        if (!this.get(this.KEYS.COURSES)) {
            this.set(this.KEYS.COURSES, this.getDefaultCourses());
        }
        
        // Initialize attendance if not exists
        if (!this.get(this.KEYS.ATTENDANCE)) {
            this.set(this.KEYS.ATTENDANCE, this.getDefaultAttendance());
        }
        
        // Initialize results if not exists
        if (!this.get(this.KEYS.RESULTS)) {
            this.set(this.KEYS.RESULTS, this.getDefaultResults());
        }
        
        console.log('Storage initialized successfully');
    },

    /**
     * Get data from Local Storage
     * @param {string} key - Storage key
     * @returns {any} Parsed data or null
     */
    get: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    },

    /**
     * Set data to Local Storage
     * @param {string} key - Storage key
     * @param {any} value - Data to store
     * @returns {boolean} Success status
     */
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to storage:', error);
            return false;
        }
    },

    /**
     * Remove data from Local Storage
     * @param {string} key - Storage key
     */
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    },

    /**
     * Clear all portal data from Local Storage
     */
    clearAll: function() {
        Object.values(this.KEYS).forEach(key => {
            this.remove(key);
        });
        console.log('All storage cleared');
    },

    /**
     * Reset storage to default data
     */
    reset: function() {
        this.clearAll();
        this.init();
        console.log('Storage reset to defaults');
    },

    // =============================================
    // DEFAULT DATA
    // =============================================

    getDefaultUsers: function() {
        return [
            { id: 'admin001', password: 'admin123', role: 'admin', name: 'System Admin' },
            { id: 'teacher001', password: 'teacher123', role: 'teacher', name: 'Dr. Sarah Johnson' },
            { id: 'teacher002', password: 'teacher123', role: 'teacher', name: 'Prof. Michael Chen' },
            { id: 'teacher003', password: 'teacher123', role: 'teacher', name: 'Dr. Emily Davis' },
            { id: 'student001', password: 'student123', role: 'student', name: 'John Smith' },
            { id: 'student002', password: 'student123', role: 'student', name: 'Emma Wilson' },
            { id: 'student003', password: 'student123', role: 'student', name: 'James Brown' },
            { id: 'student004', password: 'student123', role: 'student', name: 'Olivia Martinez' },
            { id: 'student005', password: 'student123', role: 'student', name: 'William Taylor' }
        ];
    },

    getDefaultStudents: function() {
        return [
            { 
                id: 'student001', 
                name: 'John Smith', 
                email: 'john.smith@university.edu',
                department: 'Computer Science',
                semester: 5,
                enrolledCourses: ['CS101', 'CS201', 'CS301'],
                status: 'Enrolled',
                enrollmentDate: '2022-09-01'
            },
            { 
                id: 'student002', 
                name: 'Emma Wilson', 
                email: 'emma.wilson@university.edu',
                department: 'Computer Science',
                semester: 5,
                enrolledCourses: ['CS101', 'CS201', 'CS301'],
                status: 'Enrolled',
                enrollmentDate: '2022-09-01'
            },
            { 
                id: 'student003', 
                name: 'James Brown', 
                email: 'james.brown@university.edu',
                department: 'Computer Science',
                semester: 3,
                enrolledCourses: ['CS101', 'CS201'],
                status: 'On_Probation',
                enrollmentDate: '2023-09-01'
            },
            { 
                id: 'student004', 
                name: 'Olivia Martinez', 
                email: 'olivia.martinez@university.edu',
                department: 'Information Technology',
                semester: 7,
                enrolledCourses: ['CS201', 'CS301'],
                status: 'Enrolled',
                enrollmentDate: '2021-09-01'
            },
            { 
                id: 'student005', 
                name: 'William Taylor', 
                email: 'william.taylor@university.edu',
                department: 'Computer Science',
                semester: 5,
                enrolledCourses: ['CS101', 'CS201', 'CS301'],
                status: 'Enrolled',
                enrollmentDate: '2022-09-01'
            }
        ];
    },

    getDefaultTeachers: function() {
        return [
            {
                id: 'teacher001',
                name: 'Dr. Sarah Johnson',
                email: 'sarah.johnson@university.edu',
                department: 'Computer Science',
                courses: ['CS101'],
                qualification: 'Ph.D. in Computer Science'
            },
            {
                id: 'teacher002',
                name: 'Prof. Michael Chen',
                email: 'michael.chen@university.edu',
                department: 'Computer Science',
                courses: ['CS201'],
                qualification: 'Ph.D. in Software Engineering'
            },
            {
                id: 'teacher003',
                name: 'Dr. Emily Davis',
                email: 'emily.davis@university.edu',
                department: 'Computer Science',
                courses: ['CS301'],
                qualification: 'Ph.D. in Data Science'
            }
        ];
    },

    getDefaultCourses: function() {
        return [
            {
                id: 'CS101',
                name: 'Introduction to Programming',
                code: 'CS101',
                credits: 3,
                teacherId: 'teacher001',
                teacherName: 'Dr. Sarah Johnson',
                department: 'Computer Science',
                semester: 'Fall 2024',
                totalClasses: 30
            },
            {
                id: 'CS201',
                name: 'Data Structures & Algorithms',
                code: 'CS201',
                credits: 4,
                teacherId: 'teacher002',
                teacherName: 'Prof. Michael Chen',
                department: 'Computer Science',
                semester: 'Fall 2024',
                totalClasses: 35
            },
            {
                id: 'CS301',
                name: 'Database Management Systems',
                code: 'CS301',
                credits: 3,
                teacherId: 'teacher003',
                teacherName: 'Dr. Emily Davis',
                department: 'Computer Science',
                semester: 'Fall 2024',
                totalClasses: 28
            }
        ];
    },

    getDefaultAttendance: function() {
        const attendance = [];
        const courses = ['CS101', 'CS201', 'CS301'];
        const students = ['student001', 'student002', 'student003', 'student004', 'student005'];
        
        // Generate attendance records for the past 30 days
        const today = new Date();
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;
            
            courses.forEach(courseId => {
                students.forEach(studentId => {
                    // Randomly determine attendance (80% present rate)
                    const isPresent = Math.random() > 0.2;
                    attendance.push({
                        id: `${courseId}_${studentId}_${dateStr}`,
                        courseId: courseId,
                        studentId: studentId,
                        date: dateStr,
                        status: isPresent ? 'present' : 'absent',
                        markedBy: 'teacher001',
                        markedAt: new Date().toISOString()
                    });
                });
            });
        }
        
        return attendance;
    },

    getDefaultResults: function() {
        return [
            // CS101 Results
            { id: 'r1', courseId: 'CS101', studentId: 'student001', quiz1: 18, quiz2: 17, midterm: 42, final: 85, assignment: 28, totalMarks: 0, grade: '' },
            { id: 'r2', courseId: 'CS101', studentId: 'student002', quiz1: 20, quiz2: 19, midterm: 45, final: 90, assignment: 30, totalMarks: 0, grade: '' },
            { id: 'r3', courseId: 'CS101', studentId: 'student003', quiz1: 12, quiz2: 14, midterm: 30, final: 55, assignment: 20, totalMarks: 0, grade: '' },
            { id: 'r4', courseId: 'CS101', studentId: 'student005', quiz1: 16, quiz2: 18, midterm: 40, final: 78, assignment: 25, totalMarks: 0, grade: '' },
            
            // CS201 Results
            { id: 'r5', courseId: 'CS201', studentId: 'student001', quiz1: 17, quiz2: 16, midterm: 38, final: 80, assignment: 27, totalMarks: 0, grade: '' },
            { id: 'r6', courseId: 'CS201', studentId: 'student002', quiz1: 19, quiz2: 20, midterm: 44, final: 88, assignment: 29, totalMarks: 0, grade: '' },
            { id: 'r7', courseId: 'CS201', studentId: 'student003', quiz1: 10, quiz2: 12, midterm: 28, final: 50, assignment: 18, totalMarks: 0, grade: '' },
            { id: 'r8', courseId: 'CS201', studentId: 'student004', quiz1: 15, quiz2: 17, midterm: 36, final: 75, assignment: 24, totalMarks: 0, grade: '' },
            { id: 'r9', courseId: 'CS201', studentId: 'student005', quiz1: 18, quiz2: 17, midterm: 41, final: 82, assignment: 26, totalMarks: 0, grade: '' },
            
            // CS301 Results
            { id: 'r10', courseId: 'CS301', studentId: 'student001', quiz1: 19, quiz2: 18, midterm: 43, final: 87, assignment: 28, totalMarks: 0, grade: '' },
            { id: 'r11', courseId: 'CS301', studentId: 'student002', quiz1: 20, quiz2: 20, midterm: 48, final: 95, assignment: 30, totalMarks: 0, grade: '' },
            { id: 'r12', courseId: 'CS301', studentId: 'student004', quiz1: 16, quiz2: 15, midterm: 35, final: 72, assignment: 23, totalMarks: 0, grade: '' },
            { id: 'r13', courseId: 'CS301', studentId: 'student005', quiz1: 17, quiz2: 19, midterm: 40, final: 80, assignment: 25, totalMarks: 0, grade: '' }
        ].map(result => {
            // Calculate total marks and grade
            result.totalMarks = result.quiz1 + result.quiz2 + result.midterm + result.final + result.assignment;
            result.grade = ResultsManager.calculateGrade(result.totalMarks);
            return result;
        });
    }
};

// Initialize storage when script loads
StorageManager.init();
