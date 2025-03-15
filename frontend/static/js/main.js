// Main JavaScript file for shared functionality

document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const mobileBreakpoint = 768;
    
    function handleResize() {
        if (window.innerWidth <= mobileBreakpoint) {
            // Mobile view adjustments if needed
        } else {
            // Desktop view adjustments if needed
        }
    }
    
    // Initial call and event listener
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});

