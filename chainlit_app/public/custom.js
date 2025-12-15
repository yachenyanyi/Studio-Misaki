// Custom JS to add register link to login page
document.addEventListener('DOMContentLoaded', () => {
    // Function to check and add register link
    const addRegisterLink = () => {
        // Only run on login page - Chainlit login usually has a form
        // We can check if we are authenticated or not, but custom.js runs globally
        // Best way is to check for the login form existence
        const loginForm = document.querySelector('form');
        
        if (loginForm && !document.getElementById('custom-register-link')) {
            // Check if it's the login form by looking for password input
            if (loginForm.querySelector('input[type="password"]')) {
                const linkContainer = document.createElement('div');
                linkContainer.style.marginTop = '1rem';
                linkContainer.style.textAlign = 'center';
                linkContainer.style.width = '100%';
                
                const link = document.createElement('a');
                link.id = 'custom-register-link';
                link.href = 'http://localhost:5173/register';
                link.textContent = '没有账号？点击注册';
                link.style.color = '#F472B6'; // Sakura Pink
                link.style.textDecoration = 'none';
                link.style.fontSize = '0.9rem';
                link.style.fontWeight = '500';
                link.onmouseover = () => link.style.textDecoration = 'underline';
                link.onmouseout = () => link.style.textDecoration = 'none';
                
                linkContainer.appendChild(link);
                loginForm.appendChild(linkContainer);
            }
        }
    };

    // Run initially
    addRegisterLink();

    // Use MutationObserver to handle dynamic rendering (React)
    const observer = new MutationObserver((mutations) => {
        addRegisterLink();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
