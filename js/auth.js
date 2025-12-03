/* =============================================
   AUTHENTICATION MODULE
   Handles user authentication and session management
   ============================================= */

/**
 * AuthManager - Handles all authentication operations
 * Part of the Logic Tier in our 3-Tier Client-Side Architecture
 */
const AuthManager = {
    /**
     * Authenticate user with credentials
     * @param {string} userId - User ID
     * @param {string} password - User password
     * @param {string} role - User role (admin/teacher/student)
     * @returns {object} Result with success status and user data or error message
     */
    login: function(userId, password, role) {
        // Validate inputs
        if (!userId || !password || !role) {
            return {
                success: false,
                message: 'Please fill in all fields'
            };
        }

        // Get users from storage
        const users = StorageManager.get(StorageManager.KEYS.USERS);
        
        if (!users) {
            return {
                success: false,
                message: 'System error: Unable to access user data'
            };
        }

        // Find user with matching credentials
        const user = users.find(u => 
            u.id === userId && 
            u.password === password && 
            u.role === role
        );

        if (!user) {
            return {
                success: false,
                message: 'Invalid credentials. Please check your ID, password, and role.'
            };
        }

        // Create session
        const session = {
            userId: user.id,
            name: user.name,
            role: user.role,
            loginTime: new Date().toISOString()
        };

        // Save session to storage
        StorageManager.set(StorageManager.KEYS.CURRENT_USER, session);

        return {
            success: true,
            user: session,
            redirectUrl: this.getRedirectUrl(user.role)
        };
    },

    /**
     * Log out current user
     */
    logout: function() {
        StorageManager.remove(StorageManager.KEYS.CURRENT_USER);
        window.location.href = this.getBaseUrl() + 'index.html';
    },

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn: function() {
        const session = StorageManager.get(StorageManager.KEYS.CURRENT_USER);
        return session !== null;
    },

    /**
     * Get current user session
     * @returns {object|null} Current user session or null
     */
    getCurrentUser: function() {
        return StorageManager.get(StorageManager.KEYS.CURRENT_USER);
    },

    /**
     * Get current user's role
     * @returns {string|null} User role or null
     */
    getUserRole: function() {
        const session = this.getCurrentUser();
        return session ? session.role : null;
    },

    /**
     * Check if current user has specific role
     * @param {string} role - Role to check
     * @returns {boolean}
     */
    hasRole: function(role) {
        return this.getUserRole() === role;
    },

    /**
     * Protect page - redirect if not authenticated or wrong role
     * @param {string|array} allowedRoles - Role(s) allowed to access
     */
    protectPage: function(allowedRoles) {
        if (!this.isLoggedIn()) {
            window.location.href = this.getBaseUrl() + 'index.html';
            return false;
        }

        const userRole = this.getUserRole();
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(userRole)) {
            // Redirect to appropriate dashboard
            window.location.href = this.getRedirectUrl(userRole);
            return false;
        }

        return true;
    },

    /**
     * Get redirect URL based on user role
     * @param {string} role - User role
     * @returns {string} URL to redirect
     */
    getRedirectUrl: function(role) {
        const baseUrl = this.getBaseUrl();
        switch (role) {
            case 'admin':
                return baseUrl + 'pages/admin/dashboard.html';
            case 'teacher':
                return baseUrl + 'pages/teacher/dashboard.html';
            case 'student':
                return baseUrl + 'pages/student/dashboard.html';
            default:
                return baseUrl + 'index.html';
        }
    },

    /**
     * Get base URL for navigation
     * @returns {string} Base URL
     */
    getBaseUrl: function() {
        const path = window.location.pathname;
        
        // If we're in pages/xxx/ folder
        if (path.includes('/pages/')) {
            return '../../';
        }
        
        return './';
    },

    /**
     * Get user initials for avatar
     * @param {string} name - User's full name
     * @returns {string} Initials (e.g., "JS" for "John Smith")
     */
    getInitials: function(name) {
        if (!name) return '??';
        
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    },

    /**
     * Update password for current user
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {object} Result with success status
     */
    updatePassword: function(currentPassword, newPassword) {
        const session = this.getCurrentUser();
        if (!session) {
            return { success: false, message: 'Not logged in' };
        }

        const users = StorageManager.get(StorageManager.KEYS.USERS);
        const userIndex = users.findIndex(u => u.id === session.userId);

        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }

        if (users[userIndex].password !== currentPassword) {
            return { success: false, message: 'Current password is incorrect' };
        }

        users[userIndex].password = newPassword;
        StorageManager.set(StorageManager.KEYS.USERS, users);

        return { success: true, message: 'Password updated successfully' };
    }
};
