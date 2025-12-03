/* =============================================
   LOGIN PAGE CONTROLLER
   ============================================= */

document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (AuthManager.isLoggedIn()) {
        const user = AuthManager.getCurrentUser();
        window.location.href = AuthManager.getRedirectUrl(user.role);
        return;
    }

    // Initialize form
    initLoginForm();
    initPasswordToggle();
});

/**
 * Initialize login form submission
 */
function initLoginForm() {
    const form = document.getElementById('loginForm');
    const errorDiv = document.getElementById('loginError');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const role = document.getElementById('userRole').value;
        const userId = document.getElementById('userId').value.trim();
        const password = document.getElementById('password').value;

        // Clear previous errors
        errorDiv.classList.add('hidden');
        errorDiv.textContent = '';

        // Attempt login
        const result = AuthManager.login(userId, password, role);

        if (result.success) {
            // Show success feedback (optional)
            showSuccessMessage('Login successful! Redirecting...');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                window.location.href = result.redirectUrl;
            }, 500);
        } else {
            // Show error message
            errorDiv.textContent = result.message;
            errorDiv.classList.remove('hidden');
            
            // Shake animation for error feedback
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    });
}

/**
 * Initialize password visibility toggle
 */
function initPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Update icon
            const eyeIcon = type === 'password' 
                ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'
                : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
            
            toggleBtn.querySelector('svg').innerHTML = eyeIcon;
        });
    }
}

/**
 * Show success message
 * @param {string} message - Success message to display
 */
function showSuccessMessage(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    errorDiv.style.backgroundColor = 'var(--accent-success-light)';
    errorDiv.style.color = '#065F46';
}

// Add shake animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .shake {
        animation: shake 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);
