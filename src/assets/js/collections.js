// Collections page navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.cs-nav-link');
    const sections = document.querySelectorAll('.cs-section');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 180; // Account for sticky nav
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Intersection Observer for scroll-based navigation updates
    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -80% 0px',
        threshold: [0, 0.1, 0.5]
    };
    
    let currentActiveSection = null;
    
    const observer = new IntersectionObserver(function(entries) {
        // Sort entries by intersection ratio to prioritize the most visible section
        entries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                const sectionId = entry.target.getAttribute('id');
                
                // Only update if this is a different section
                if (currentActiveSection !== sectionId) {
                    currentActiveSection = sectionId;
                    
                    // Remove active class from all navigation links
                    navLinks.forEach(link => {
                        link.classList.remove('cs-nav-active');
                    });
                    
                    // Add active class to corresponding navigation link
                    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
                    if (activeLink) {
                        activeLink.classList.add('cs-nav-active');
                    }
                }
            }
        });
    }, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Fallback scroll event listener for better responsiveness
    let ticking = false;
    
    function updateActiveNavigation() {
        const scrollPosition = window.scrollY + 250; // Account for sticky nav offset
        
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const sectionId = section.getAttribute('id');
                
                if (currentActiveSection !== sectionId) {
                    currentActiveSection = sectionId;
                    
                    // Remove active class from all navigation links
                    navLinks.forEach(link => {
                        link.classList.remove('cs-nav-active');
                    });
                    
                    // Add active class to corresponding navigation link
                    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
                    if (activeLink) {
                        activeLink.classList.add('cs-nav-active');
                    }
                }
                break;
            }
        }
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateActiveNavigation);
            ticking = true;
        }
    }
    
    // Add scroll event listener as fallback
    window.addEventListener('scroll', requestTick);
    
    // Set initial active state
    if (navLinks.length > 0) {
        navLinks[0].classList.add('cs-nav-active');
        currentActiveSection = sections[0] ? sections[0].getAttribute('id') : null;
    }
});
