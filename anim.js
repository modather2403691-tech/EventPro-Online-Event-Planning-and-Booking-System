// ========== EYE TRACKING ==========
document.addEventListener('mousemove', (e) => {
    const pupils = document.querySelectorAll('.pupil');

    pupils.forEach(pupil => {
        // Skip if sad mode — pupils look down via CSS
        if (document.body.classList.contains('sad-mode') || 
            document.body.classList.contains('scared-mode')) return;

        const eye = pupil.parentElement;
        const rect = eye.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;

        const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
        const maxMove = 6;

        const moveX = Math.cos(angle) * maxMove;
        const moveY = Math.sin(angle) * maxMove;

        pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
});

// ========== PASSWORD TOGGLE ==========
const loginEmailInput = document.querySelector('input[type="email"]');
const passwordInput = document.getElementById('password');
const toggleEye = document.getElementById('toggleEye');

if (loginEmailInput) {
    const loginParams = new URLSearchParams(window.location.search);
    const presetEmail = loginParams.get('email');

    if (presetEmail) {
        loginEmailInput.value = presetEmail;
    }
}

toggleEye.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleEye.textContent = isPassword ? '🙈' : '👁';
});

// ========== MOOD SYSTEM ==========
const body = document.body;

// Remove all mood classes cleanly
function clearMoods() {
    body.classList.remove('sad-mode', 'scared-mode', 'happy-mode');
}

// On focus — sad (covering eyes feel)
passwordInput.addEventListener('focus', () => {
    clearMoods();
    // Short delay so user sees the transition
    setTimeout(() => {
        body.classList.add('sad-mode');
    }, 50);
});

// On blur — back to normal
passwordInput.addEventListener('blur', () => {
    clearMoods();
});

// On typing — scared (peeking reaction)
passwordInput.addEventListener('input', () => {
    const len = passwordInput.value.length;

    if (len === 0) {
        clearMoods();
        body.classList.add('sad-mode');
    } else if (len < 4) {
        clearMoods();
        body.classList.add('scared-mode');
    } else {
        // Long password — they calm down a bit, stay scared but less intense
        clearMoods();
        body.classList.add('scared-mode');
    }
});

// ========== FORM SUBMIT ==========
const loginForm = document.getElementById('loginForm');
const btnLogin = document.querySelector('.btn-login');
const characterContainer = document.querySelector('.character-container');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Simple validation
    const email = loginForm.querySelector('input[type="email"]');
    const emailGroup = email.closest('.input-group');
    const passwordGroup = passwordInput.closest('.input-group');
    let valid = true;

    // Clear previous errors
    document.querySelectorAll('.input-group').forEach(g => g.classList.remove('error'));

    if (!email.value || !email.value.includes('@')) {
        emailGroup.classList.add('error');
        valid = false;
    }

    if (!passwordInput.value) {
        passwordGroup.classList.add('error');
        valid = false;
    }

    if (!valid) {
        // Amazing error reaction — characters go super sad with shake
        clearMoods();
        body.classList.add('sad-mode', 'error-flash');
        characterContainer.classList.add('shake');
        
        // Remove shake and flash after animation
        setTimeout(() => {
            characterContainer.classList.remove('shake');
            body.classList.remove('error-flash');
        }, 500);
        
        // Dramatic pause
        setTimeout(() => {
            if (!passwordInput.matches(':focus') && !email.matches(':focus')) clearMoods();
        }, 3000);
        return;
    }

    // Success — show loading then happy
    btnLogin.classList.add('loading');
    clearMoods();

    setTimeout(() => {
        btnLogin.classList.remove('loading');
        clearMoods();
        body.classList.add('happy-mode');

        // Reset after a few seconds
        setTimeout(() => {
            clearMoods();
            loginForm.reset();
        }, 3000);
    }, 1800);
});

// ========== CLEAR ERRORS ON INPUT ==========
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        input.closest('.input-group').classList.remove('error');
    });
});