// ========== EYE TRACKING ==========
document.addEventListener('mousemove', (e) => {
    const pupils = document.querySelectorAll('.pupil');

    pupils.forEach(pupil => {
        // Skip while the password field is active or a mood class is set.
        if (document.activeElement === passwordInput ||
            document.body.classList.contains('sad-mode') || 
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

function resetPupilsToCenter() {
    const pupils = document.querySelectorAll('.pupil');
    pupils.forEach((pupil) => {
        pupil.style.transform = 'translate(0px, 0px)';
    });
}

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

  if (toggleEye && passwordInput) {
    toggleEye.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      toggleEye.textContent = isPassword ? '🙈' : '👁';
    });
  }

// ========== MOOD SYSTEM ==========
const body = document.body;

// Remove all mood classes cleanly
function clearMoods() {
    body.classList.remove('sad-mode', 'scared-mode', 'happy-mode');
}

if (passwordInput) {

    passwordInput.addEventListener('focus', () => {
        clearMoods();
        body.classList.add('sad-mode');
        body.classList.add('password-lock');
        resetPupilsToCenter();
    });

    passwordInput.addEventListener('blur', () => {
        clearMoods();
        body.classList.remove('password-lock');
        resetPupilsToCenter();
    });

    passwordInput.addEventListener('input', () => {
        const len = passwordInput.value.length;

        if (len === 0) {
            clearMoods();
            body.classList.add('sad-mode');
        } else {
            clearMoods();
            body.classList.add('scared-mode');
        }
    });

}
/*validation of admin in login page */


document.addEventListener("DOMContentLoaded", function () {

  const contactForm = document.getElementById("contactForm");

  if (!contactForm) return;

  const name = document.getElementById("contactName");
  const email = document.getElementById("contactEmail");
  const message = document.getElementById("contactMessage");

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    // clear errors
    document.querySelectorAll("#contactForm .error").forEach(el => el.textContent = "");

    // NAME
    if (name.value.trim() === "") {
      document.getElementById("contactNameError").textContent = "Name is required";
      isValid = false;
    }

    // EMAIL
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.value.trim() === "") {
      document.getElementById("contactEmailError").textContent = "Email is required";
      isValid = false;
    } 
    else if (!emailPattern.test(email.value)) {
      document.getElementById("contactEmailError").textContent = "Enter a valid email";
      isValid = false;
    }

    // MESSAGE
    if (message.value.trim() === "") {
      document.getElementById("contactMessageError").textContent = "Message is required";
      isValid = false;
    }
    else if (message.value.trim().length < 10) {
      document.getElementById("contactMessageError").textContent = "Message must be at least 10 characters";
      isValid = false;
    }

    // SUCCESS
    if (isValid) {
      alert("Message sent successfully 🎉");
      contactForm.reset();
    }
  });

});
document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("registerForm");

  if (!form) return;

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const dob = document.getElementById("dob");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const phone = document.getElementById("phone");
  const passwordPattern = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const dobError = document.getElementById("dobError");

  const getMaxBirthDate = () => {
    const limit = new Date();
    limit.setFullYear(limit.getFullYear() - 18);
    return limit.toISOString().split("T")[0];
  };

  if (dob) {
    dob.max = getMaxBirthDate();
  }

  const validateName = () => {
    const value = name.value.trim();

    if (value.length < 9) {
      document.getElementById("nameError").textContent = "Name must be at least 9 characters";
      name.classList.add("error-border");
      return false;
    }

    document.getElementById("nameError").textContent = "";
    name.classList.remove("error-border");
    return true;
  };

  const validatePassword = () => {
    const value = password.value.trim();

    if (!passwordPattern.test(value)) {
      document.getElementById("passwordError").textContent = "Password must be at least 8 characters and include a number and special symbol";
      password.classList.add("error-border");
      return false;
    }

    document.getElementById("passwordError").textContent = "";
    password.classList.remove("error-border");
    return true;
  };

  const validateConfirmPassword = () => {
    const confirmValue = confirmPassword.value.trim();

    if (confirmValue === "") {
      document.getElementById("confirmPasswordError").textContent = "Confirm password is required";
      confirmPassword.classList.add("error-border");
      return false;
    }

    if (confirmValue !== password.value.trim()) {
      document.getElementById("confirmPasswordError").textContent = "Passwords do not match";
      confirmPassword.classList.add("error-border");
      return false;
    }

    document.getElementById("confirmPasswordError").textContent = "";
    confirmPassword.classList.remove("error-border");
    return true;
  };

  const validateDob = () => {
    if (dob.value === "") {
      dobError.textContent = "Date of birth is required";
      dob.classList.add("error-border");
      return false;
    }

    const birthDate = new Date(dob.value);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    if (age < 18) {
      dobError.textContent = "You must be at least 18 years old";
      dob.classList.add("error-border");
      return false;
    }

    dobError.textContent = "";
    dob.classList.remove("error-border");
    return true;
  };

 name.addEventListener("input", validateName);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

email.addEventListener("input", () => {
  if (!emailPattern.test(email.value)) {
    document.getElementById("emailError").textContent = "Invalid email";
    email.classList.add("error-border");
  } else {
    document.getElementById("emailError").textContent = "";
    email.classList.remove("error-border");
  }
});

phone.addEventListener("input", () => {
  phone.value = phone.value.replace(/[^0-9]/g, "");

  if (!phone.value.startsWith("01")) {
    document.getElementById("phoneError").textContent = "Must start with 01";
  } 
  else if (phone.value.length !== 11) {
    document.getElementById("phoneError").textContent = "Must be 11 digits";
  } 
  else {
    document.getElementById("phoneError").textContent = "";
  }
});

password.addEventListener("input", () => {
  validatePassword();
});

confirmPassword.addEventListener("input", () => {
  validateConfirmPassword();
});

dob.addEventListener("input", () => {
  validateDob();
});
  phone.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    document.querySelectorAll(".error").forEach(el => el.textContent = "");

    if (!validateName()) {
      isValid = false;
    }

    if (email.value.trim() === "") {
      document.getElementById("emailError").textContent = "Email is required";
      isValid = false;
    } 
    else if (!email.value.includes("@")) {
      document.getElementById("emailError").textContent = "Email must contain @";
      isValid = false;
    }

    if (!validateDob()) {
      isValid = false;
    }

    if (!validatePassword()) {
      isValid = false;
    }

    if (!validateConfirmPassword()) {
      isValid = false;
    }

    if (!phone.value.startsWith("01")) {
      document.getElementById("phoneError").textContent = "Phone must start with 01";
      isValid = false;
    }

    if (phone.value.length !== 11) {
      document.getElementById("phoneError").textContent = "Phone must be 11 digits";
      isValid = false;
    }
// ... (جزء الـ validation بتاعك)

    if (isValid) {
        // alert("Registered successfully 🎉"); 
        
        // شلنا الـ if والـ window.location.href خالص
        // وبنقول للـ form: ابعت البيانات للسيرفر دلوقتي
        form.submit(); 
    }
});

});
