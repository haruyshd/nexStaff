// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    // Toggle mobile menu
    mobileMenuButton.addEventListener('click', function() {
        navLinks.classList.toggle('show');
        // Update aria-expanded attribute for accessibility
        const isExpanded = navLinks.classList.contains('show');
        mobileMenuButton.setAttribute('aria-expanded', isExpanded);
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = navLinks.contains(event.target) || mobileMenuButton.contains(event.target);
        if (!isClickInside && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
        }
    });

    // Close mobile menu when window is resized above mobile breakpoint
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
        }
    });

    // Set active state based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLink = document.querySelector(`.nav-links a[href$="${currentPage}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
});
