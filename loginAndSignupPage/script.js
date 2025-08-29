// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyDbREhUz2kM-V9bXCUowgRB9ChyJVP8jsc",
    authDomain: "message-me-5b34a.firebaseapp.com",
    databaseURL: "https://message-me-5b34a-default-rtdb.firebaseio.com",
    projectId: "message-me-5b34a",
    storageBucket: "message-me-5b34a.firebasestorage.app",
    messagingSenderId: "1047092447100",
    appId: "1:1047092447100:web:56132b92cbe8dfcd5046f9",
    measurementId: "G-0R9KFJXJ33"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loginError = document.getElementById('login-error');
const loginSuccess = document.getElementById('login-success');
const signupError = document.getElementById('signup-error');
const signupSuccess = document.getElementById('signup-success');
const loginBtnText = document.getElementById('login-btn-text');
const loginSpinner = document.getElementById('login-spinner');
const signupBtnText = document.getElementById('signup-btn-text');
const signupSpinner = document.getElementById('signup-spinner');

// Password toggle functionality
function setupPasswordToggle(passwordFieldId, toggleIconId) {
    const passwordField = document.getElementById(passwordFieldId);
    const toggleIcon = document.getElementById(toggleIconId);

    toggleIcon.addEventListener('click', () => {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    });
}

// Set up password toggles
setupPasswordToggle('login-password', 'toggle-login-password');
setupPasswordToggle('signup-password', 'toggle-signup-password');
setupPasswordToggle('signup-confirm-password', 'toggle-signup-confirm-password');

// Toggle between login and signup forms with animation
function toggleForms(showForm, hideForm) {
    hideForm.classList.add('hidden');
    setTimeout(() => {
        showForm.classList.remove('hidden');
        showForm.classList.add('form-switch');
        setTimeout(() => {
            showForm.classList.remove('form-switch');
        }, 500);
    }, 10);
    clearMessages();
}

showSignup.addEventListener('click', () => {
    toggleForms(signupForm, loginForm);
});

showLogin.addEventListener('click', () => {
    toggleForms(loginForm, signupForm);
});

// Clear error/success messages
function clearMessages() {
    loginError.classList.add('hidden');
    loginSuccess.classList.add('hidden');
    signupError.classList.add('hidden');
    signupSuccess.classList.add('hidden');
}

// Show loading state for buttons
function showLoading(btn, btnText, spinner) {
    btn.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
}

function hideLoading(btn, btnText, spinner) {
    btn.disabled = false;
    btnText.classList.remove('hidden');
    spinner.classList.add('hidden');
}

// Login function
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Simple validation
    if (!email || !password) {
        loginError.textContent = 'Please fill in all fields';
        loginError.classList.remove('hidden');
        return;
    }

    showLoading(loginBtn, loginBtnText, loginSpinner);
    loginError.classList.add('hidden');

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            loginSuccess.textContent = 'Login successful! Redirecting...';
            loginSuccess.classList.remove('hidden');

            // Redirect to another page after successful login
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        })
        .catch((error) => {
            loginError.textContent = error.message;
            loginError.classList.remove('hidden');
            loginSuccess.classList.add('hidden');
        })
        .finally(() => {
            hideLoading(loginBtn, loginBtnText, loginSpinner);
        });
});

// Signup function
signupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Validation
    if (!email || !password || !confirmPassword) {
        signupError.textContent = 'Please fill in all fields';
        signupError.classList.remove('hidden');
        return;
    }

    if (password !== confirmPassword) {
        signupError.textContent = 'Passwords do not match';
        signupError.classList.remove('hidden');
        return;
    }

    if (password.length < 6) {
        signupError.textContent = 'Password should be at least 6 characters';
        signupError.classList.remove('hidden');
        return;
    }

    showLoading(signupBtn, signupBtnText, signupSpinner);
    signupError.classList.add('hidden');

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed up
            signupSuccess.textContent = 'Signup successful! You can now login.';
            signupSuccess.classList.remove('hidden');

            // Clear form
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-password').value = '';
            document.getElementById('signup-confirm-password').value = '';

            // Show login form after 2 seconds
            setTimeout(() => {
                toggleForms(loginForm, signupForm);
            }, 2000);
        })
        .catch((error) => {
            signupError.textContent = error.message;
            signupError.classList.remove('hidden');
        })
        .finally(() => {
            hideLoading(signupBtn, signupBtnText, signupSpinner);
        });
});

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, redirect to another page
        window.location.href = '../homePage/home.html';
    }
});

// Add subtle hover effect to form inputs
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('mouseenter', () => {
        input.style.transform = 'translateY(-2px)';
        input.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
    });

    input.addEventListener('mouseleave', () => {
        input.style.transform = '';
        input.style.boxShadow = '';
    });
});