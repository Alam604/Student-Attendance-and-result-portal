/* =============================================
   UI UTILITIES MODULE
   ============================================= */

/**
 * UIManager - Handles common UI operations
 */
const UIManager = {
    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds
     */
    showToast: function(message, type = 'info', duration = 3000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(t => t.remove());

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;

        // Add styles if not already present
        if (!document.getElementById('toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    min-width: 300px;
                    max-width: 400px;
                    padding: 16px 20px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                }
                .toast-success { background-color: #D1FAE5; color: #065F46; border: 1px solid #10B981; }
                .toast-error { background-color: #FEE2E2; color: #991B1B; border: 1px solid #EF4444; }
                .toast-warning { background-color: #FEF3C7; color: #92400E; border: 1px solid #F59E0B; }
                .toast-info { background-color: #DBEAFE; color: #1E40AF; border: 1px solid #3B82F6; }
                .toast-icon { font-size: 20px; }
                .toast-message { flex: 1; font-size: 14px; font-weight: 500; }
                .toast-close { background: none; border: none; font-size: 20px; cursor: pointer; opacity: 0.7; }
                .toast-close:hover { opacity: 1; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(toast);

        // Close button functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.closeToast(toast);
        });

        // Auto close
        setTimeout(() => {
            this.closeToast(toast);
        }, duration);
    },

    /**
     * Close toast with animation
     * @param {HTMLElement} toast - Toast element
     */
    closeToast: function(toast) {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    },

    /**
     * Get icon for toast type
     * @param {string} type - Toast type
     * @returns {string} Icon
     */
    getToastIcon: function(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    },

    /**
     * Show modal dialog
     * @param {object} options - Modal options
     */
    showModal: function(options) {
        const { title, content, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' } = options;

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary modal-cancel">${cancelText}</button>
                    <button class="btn btn-primary modal-confirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Event listeners
        const closeModal = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 200);
        };

        overlay.querySelector('.modal-close').addEventListener('click', closeModal);
        overlay.querySelector('.modal-cancel').addEventListener('click', () => {
            if (onCancel) onCancel();
            closeModal();
        });
        overlay.querySelector('.modal-confirm').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            closeModal();
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    },

    /**
     * Show confirmation dialog
     * @param {string} message - Confirmation message
     * @param {function} onConfirm - Callback on confirm
     */
    confirm: function(message, onConfirm) {
        this.showModal({
            title: 'Confirm Action',
            content: `<p>${message}</p>`,
            onConfirm: onConfirm,
            confirmText: 'Yes',
            cancelText: 'No'
        });
    },

    /**
     * Format date for display
     * @param {string} dateStr - Date string
     * @returns {string} Formatted date
     */
    formatDate: function(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Format date for input
     * @param {Date} date - Date object
     * @returns {string} YYYY-MM-DD format
     */
    formatDateForInput: function(date = new Date()) {
        return date.toISOString().split('T')[0];
    },

    /**
     * Format time for display
     * @param {string} dateStr - Date string
     * @returns {string} Formatted time
     */
    formatTime: function(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Get relative time (e.g., "2 hours ago")
     * @param {string} dateStr - Date string
     * @returns {string} Relative time
     */
    getRelativeTime: function(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        if (days < 7) return `${days} days ago`;
        
        return this.formatDate(dateStr);
    },

    /**
     * Debounce function
     * @param {function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {function} Debounced function
     */
    debounce: function(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHTML: function(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Initialize sidebar toggle for mobile
     */
    initSidebar: function() {
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (menuToggle && sidebar) {
            // Create overlay
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
            }

            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
            });

            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
    },

    /**
     * Initialize user info in sidebar
     */
    initUserInfo: function() {
        const user = AuthManager.getCurrentUser();
        if (!user) return;

        const userAvatar = document.querySelector('.user-avatar');
        const userName = document.querySelector('.user-name');
        const userRole = document.querySelector('.user-role');

        if (userAvatar) userAvatar.textContent = AuthManager.getInitials(user.name);
        if (userName) userName.textContent = user.name;
        if (userRole) userRole.textContent = user.role;
    },

    /**
     * Initialize logout button
     */
    initLogout: function() {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.confirm('Are you sure you want to logout?', () => {
                    AuthManager.logout();
                });
            });
        }
    },

    /**
     * Set active navigation link
     * @param {string} page - Page identifier
     */
    setActiveNav: function(page) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
    },

    /**
     * Initialize common dashboard elements
     */
    initDashboard: function() {
        this.initSidebar();
        this.initUserInfo();
        this.initLogout();
    },

    /**
     * Create progress bar HTML
     * @param {number} percentage - Percentage value
     * @param {string} type - Type for color class
     * @returns {string} HTML string
     */
    createProgressBar: function(percentage, type = 'primary') {
        let colorClass = type;
        if (type === 'auto') {
            if (percentage >= 75) colorClass = 'success';
            else if (percentage >= 50) colorClass = 'warning';
            else colorClass = 'danger';
        }
        return `
            <div class="progress-bar">
                <div class="progress-fill ${colorClass}" style="width: ${percentage}%"></div>
            </div>
        `;
    },

    /**
     * Create badge HTML
     * @param {string} text - Badge text
     * @param {string} type - Badge type
     * @returns {string} HTML string
     */
    createBadge: function(text, type = 'primary') {
        return `<span class="badge badge-${type}">${text}</span>`;
    },

    /**
     * Show loading overlay
     */
    showLoading: function() {
        let overlay = document.querySelector('.loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    },

    /**
     * Hide loading overlay
     */
    hideLoading: function() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
};
