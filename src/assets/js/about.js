// Awards Carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('awards-carousel');
    
    if (carousel) {
        // Pause animation on hover
        carousel.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        // Resume animation when mouse leaves
        carousel.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
        
        // Handle reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            carousel.style.animation = 'none';
        }
        
        // Ensure smooth scrolling on focus for accessibility
        const cards = carousel.querySelectorAll('.cs-award-card');
        cards.forEach(card => {
            card.addEventListener('focus', function() {
                carousel.style.animationPlayState = 'paused';
            });
            
            card.addEventListener('blur', function() {
                carousel.style.animationPlayState = 'running';
            });
        });
    }
});
