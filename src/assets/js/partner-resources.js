// ─────────────────────────────────────────────────────────────────────────────
// PARTNER RESOURCES JAVASCRIPT
// Interactive features for the partner-resources page including authentication,
// card animations, resource filtering, and quick actions
// ─────────────────────────────────────────────────────────────────────────────

// Authentication state
let currentUser = null;

// API Configuration - adjust the base URL based on environment
const API_BASE_URL = (window.location.port === '8082' || window.location.port === '8080') ? 'http://localhost:3000' : '';

// Add debug function to help troubleshoot session issues
window.showDebugInfo = async function() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/session`);
        const sessionData = await response.json();
        
        let debugText = 'SERVER SESSION DEBUG INFO:\n\n';
        debugText += `API Base URL: ${API_BASE_URL}\n`;
        debugText += `Current Port: ${window.location.port}\n`;
        debugText += `Authenticated: ${sessionData.authenticated ? 'YES' : 'NO'}\n`;
        
        if (sessionData.authenticated && sessionData.user) {
            debugText += `Username: ${sessionData.user.username}\n`;
            debugText += `Role: ${sessionData.user.role}\n`;
            debugText += `Permissions: ${sessionData.user.permissions.join(', ')}\n`;
        }
        
        debugText += `Response Status: ${response.status}\n`;
        debugText += `Server Time: ${new Date().toLocaleString()}\n`;
        
        alert(debugText);
    } catch (error) {
        alert('Error checking session: ' + error.message + '\n\nMake sure the authentication server is running on port 3000');
    }
};

// API helper functions
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for session
    };
    
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(fullUrl, { ...defaultOptions, ...options });
    
    // Check if we got HTML instead of JSON (common error when API server is not running)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
        throw new Error('Authentication server not available. Please ensure the server is running on port 3000.');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }
    
    return data;
}
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication
    initializeAuth();
});

async function initializeAuth() {
    const authOverlay = document.getElementById('auth-overlay');
    const mainContent = document.getElementById('main-content');
    const loginForm = document.getElementById('login-form');
    const authError = document.getElementById('auth-error');

    // Check if user is already authenticated
    if (await isAuthenticated()) {
        hideAuthOverlay();
        showMainContent();
        initializeMainFeatures();
        return;
    }

    // Show authentication overlay
    authOverlay.style.display = 'flex';

    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Disable form during login
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Authenticating...';
        
        try {
            await validateCredentials(username, password);
            
            // Hide auth overlay and show main content
            hideAuthOverlay();
            showMainContent();
            
            // Initialize main features
            initializeMainFeatures();
            
            // Clear form
            loginForm.reset();
            authError.style.display = 'none';
            
        } catch (error) {
            // Show error message
            authError.style.display = 'block';
            authError.textContent = error.message || 'Authentication failed. Please try again.';
            
            // Clear password field
            document.getElementById('password').value = '';
            
            // Add shake animation to form
            const authContainer = document.querySelector('.cs-auth-container');
            authContainer.style.animation = 'none';
            setTimeout(() => {
                authContainer.style.animation = 'authShake 0.5s ease-out';
            }, 10);
            
        } finally {
            // Re-enable form
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });

    // Add input event listeners to clear error when user starts typing
    ['username', 'password'].forEach(id => {
        document.getElementById(id).addEventListener('input', function() {
            authError.style.display = 'none';
        });
    });
}

async function validateCredentials(username, password) {
    try {
        const data = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (data.success) {
            currentUser = data.user;
            return true;
        } else {
            throw new Error(data.message || 'Invalid credentials');
        }
    } catch (error) {
        // Provide specific error messages based on the type of error
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Cannot connect to authentication server. Please ensure the server is running on port 3000.');
        } else if (error.message.includes('not available')) {
            throw new Error('Authentication server is not available. Please start the server with: node server.js');
        } else {
            throw error;
        }
    }
}

async function isAuthenticated() {
    try {
        const data = await apiCall('/api/auth/session');
        if (data.success && data.authenticated) {
            currentUser = data.user;
            return true;
        }
        return false;
    } catch (error) {
        console.log('Session check failed:', error.message);
        
        // Show helpful error message if server is not running
        if (error.message.includes('Failed to fetch') || error.message.includes('not available')) {
            showServerError();
        }
        
        return false;
    }
}

function showServerError() {
    const authError = document.getElementById('auth-error');
    if (authError) {
        authError.style.display = 'block';
        authError.innerHTML = `
            <strong>Server Connection Error</strong><br>
            The authentication server is not running.<br><br>
            <strong>To fix this:</strong><br>
            1. Open a terminal and run: <code>node server.js</code><br>
            2. Or use the startup script: <code>start-servers.ps1</code><br><br>
            <em>The auth server should be running on port 3000</em>
        `;
        authError.style.fontSize = '12px';
        authError.style.textAlign = 'left';
        authError.style.padding = '16px';
        authError.style.backgroundColor = '#fff3cd';
        authError.style.borderColor = '#ffeaa7';
        authError.style.color = '#856404';
    }
}

function hideAuthOverlay() {
    const authOverlay = document.getElementById('auth-overlay');
    if (authOverlay) {
        authOverlay.style.opacity = '0';
        authOverlay.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            authOverlay.classList.add('cs-hidden');
            authOverlay.style.display = 'none';
        }, 300);
    }
}

function showMainContent() {
    const mainContent = document.getElementById('main-content');
    mainContent.style.display = 'block';
    mainContent.classList.add('cs-authenticated');
}

async function logout() {
    try {
        await apiCall('/api/auth/logout', {
            method: 'POST'
        });
        
        currentUser = null;
        location.reload();
    } catch (error) {
        console.error('Logout failed:', error.message);
        // Force reload anyway to clear client state
        location.reload();
    }
}

function initializeMainFeatures() {
    // Smooth scrolling for internal links
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Card hover enhancements
    const cards = document.querySelectorAll('.cs-card, .cs-action-card, .cs-benefit');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Simple analytics tracking for quick actions
    const actionCards = document.querySelectorAll('.cs-action-card');
    
    actionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const actionTitle = this.querySelector('.cs-action-title').textContent;
            console.log(`Ambassador action clicked: ${actionTitle}`);
            
            // Here you could add actual analytics tracking
            // For example: gtag('event', 'ambassador_action_click', { action_name: actionTitle });
        });
    });

    // Add a simple notification system for updates
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `cs-notification cs-notification--${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--secondary);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        `;
        
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Simulate loading updates (this would normally come from an API)
    setTimeout(() => {
        const updateItems = document.querySelectorAll('.cs-update-item');
        if (updateItems.length > 0) {
            
        }
    }, 1000);

    // Add interactive tooltips for icons
    const icons = document.querySelectorAll('.cs-icon, .cs-card-icon svg, .cs-action-icon svg');
    
    icons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Progressive enhancement for resource categories
    const resourceCategories = document.querySelectorAll('.cs-resource-category');
    
    resourceCategories.forEach(category => {
        category.addEventListener('click', function() {
            const categoryName = this.querySelector('.cs-category-name').textContent;
            showNotification(`Opening ${categoryName}...`);
            
            // Here you would normally navigate to the resource category
            // For now, just log the action
            console.log(`Resource category clicked: ${categoryName}`);
        });
        
        // Add cursor pointer style
        category.style.cursor = 'pointer';
        category.style.transition = 'background-color 0.2s ease';
        
        category.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f9fafb';
        });
        
        category.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
    });

    // Add loading states for card links
    const cardLinks = document.querySelectorAll('.cs-card-link');
    
    cardLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.style.pointerEvents = 'none';
            
            // Simulate loading
            setTimeout(() => {
                this.textContent = originalText;
                this.style.pointerEvents = 'auto';
                
            }, 1500);
        });
    });

    // Keyboard accessibility improvements
    document.addEventListener('keydown', function(e) {
        // ESC key to close any open modals or notifications
        if (e.key === 'Escape') {
            const notifications = document.querySelectorAll('.cs-notification');
            notifications.forEach(notification => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
        }
    });

    // Lazy loading simulation for better performance
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('cs-animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe cards for animation
    const animatableElements = document.querySelectorAll('.cs-card, .cs-benefit, .cs-action-card');
    animatableElements.forEach(el => {
        observer.observe(el);
    });

    console.log('Ambassador Hub features initialized successfully!');
}

// Add CSS for shake animation
const shakeCSS = `
@keyframes authShake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

// Inject shake animation CSS
const style = document.createElement('style');
style.textContent = shakeCSS;
document.head.appendChild(style);

// Expose logout function globally for potential logout button
window.partnerLogout = logout;
