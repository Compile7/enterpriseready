// Page behaviour (external so the CSP needs no 'unsafe-inline' in script-src).
document.getElementById('current-year').textContent = new Date().getFullYear();
// Simple form handling
// The sign-up form is commented out above; only wire it up when present.
document.getElementById('email-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;

    // In a real implementation, you would send this to your backend
    console.log('Subscription email:', email);

    // Show success message
    const button = e.target.querySelector('button');
    const originalText = button.textContent;
    button.textContent = 'Thanks for subscribing!';
    button.disabled = true;

    // Reset form after 3 seconds
    setTimeout(() => {
        e.target.reset();
        button.textContent = originalText;
        button.disabled = false;
    }, 3000);
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

