// ─────────────────────────────────────────────────────────────────────────────
// PARTNER RESOURCES JAVASCRIPT
// Interactive features for the partner-resources page including authentication,
// card animations, resource filtering, and quick actions
// ─────────────────────────────────────────────────────────────────────────────

// Authentication crede// Expose logout function globally for potential logout button
window.partnerLogout = logout;

// Add debug function to help troubleshoot session issues
window.showDebugInfo = function() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    const now = Date.now();
    
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            const info = {
                'Session Key': SESSION_KEY,
                'Username': session.username,
                'Created': new Date(session.timestamp).toLocaleString(),
                'Expires': new Date(session.expires).toLocaleString(),
                'Current Time': new Date(now).toLocaleString(),
                'Time Until Expiry': Math.round((session.expires - now) / (1000 * 60)) + ' minutes',
                'Is Valid': now < session.expires ? 'YES' : 'NO'
            };
            
            let debugText = 'SESSION DEBUG INFO:\n\n';
            for (const [key, value] of Object.entries(info)) {
                debugText += `${key}: ${value}\n`;
            }
            
            alert(debugText);
        } catch (error) {
            alert('Error parsing session data: ' + error.message);
        }
    } else {
        alert('No session data found in localStorage');
    }
};

// Authentication credentials (in production, this should be handled server-side)
const VALID_CREDENTIALS = {
    'ambassador': 'noblessa2024',
    'partner': 'luxury2024',
    'admin': 'admin2024'
};

// Session management
const SESSION_KEY = 'noblessa_auth_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize authentication
    initializeAuth();
});

function initializeAuth() {
    const authOverlay = document.getElementById('auth-overlay');
    const mainContent = document.getElementById('main-content');
    const loginForm = document.getElementById('login-form');
    const authError = document.getElementById('auth-error');

    // Check if user is already authenticated
    if (isAuthenticated()) {
        hideAuthOverlay();
        showMainContent();
        initializeMainFeatures();
        return;
    }

    // Show authentication overlay
    authOverlay.style.display = 'flex';

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (validateCredentials(username, password)) {
            // Store authentication session
            storeAuthSession(username);
            
            // Hide auth overlay and show main content
            hideAuthOverlay();
            showMainContent();
            
            // Initialize main features
            initializeMainFeatures();
            
            // Clear form
            loginForm.reset();
            authError.style.display = 'none';
        } else {
            // Show error message
            authError.style.display = 'block';
            authError.textContent = 'Invalid credentials. Please try again.';
            
            // Clear password field
            document.getElementById('password').value = '';
            
            // Add shake animation to form
            const authContainer = document.querySelector('.cs-auth-container');
            authContainer.style.animation = 'none';
            setTimeout(() => {
                authContainer.style.animation = 'authShake 0.5s ease-out';
            }, 10);
        }
    });

    // Add input event listeners to clear error when user starts typing
    ['username', 'password'].forEach(id => {
        document.getElementById(id).addEventListener('input', function() {
            authError.style.display = 'none';
        });
    });
}

function validateCredentials(username, password) {
    return VALID_CREDENTIALS[username.toLowerCase()] === password;
}

function storeAuthSession(username) {
    const sessionData = {
        username: username,
        timestamp: Date.now(),
        expires: Date.now() + SESSION_DURATION
    };
    
    console.log('Storing session:', {
        username: sessionData.username,
        expires: new Date(sessionData.expires).toLocaleString(),
        duration: SESSION_DURATION / (1000 * 60 * 60) + ' hours'
    });
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

function isAuthenticated() {
    const sessionData = localStorage.getItem(SESSION_KEY);
    
    if (!sessionData) {
        console.log('No session data found');
        return false;
    }
    
    try {
        const session = JSON.parse(sessionData);
        const now = Date.now();
        const isValid = now < session.expires;
        
        console.log('Session check:', {
            now: new Date(now).toLocaleString(),
            expires: new Date(session.expires).toLocaleString(),
            username: session.username,
            isValid: isValid
        });
        
        if (!isValid) {
            console.log('Session expired, removing');
            localStorage.removeItem(SESSION_KEY);
        }
        
        return isValid;
    } catch (error) {
        console.log('Error parsing session data:', error);
        // Clear invalid session data
        localStorage.removeItem(SESSION_KEY);
        return false;
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

function logout() {
    localStorage.removeItem(SESSION_KEY);
    location.reload();
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
