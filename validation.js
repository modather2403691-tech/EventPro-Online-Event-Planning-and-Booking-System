const bookingForm = document.getElementById('bookingForm');
const isEventSource = new URLSearchParams(window.location.search).get('source') === 'event';

if (bookingForm) {
  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    let isValid = true;

    document.querySelectorAll('.error').forEach(error => error.textContent = '');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const eventType = document.getElementById('eventType').value;
    const eventDate = document.getElementById('eventDate').value;
    const guests = document.getElementById('guests').value.trim();

    if (name === '') {
      document.getElementById('nameError').textContent = 'Name is required';
      isValid = false;
    }

    if (email === '') {
      document.getElementById('emailError').textContent = 'Email is required';
      isValid = false;
    } else if (!email.includes('@')) {
      document.getElementById('emailError').textContent = 'Enter a valid email';
      isValid = false;
    }

    if (phone === '') {
      document.getElementById('phoneError').textContent = 'Phone number is required';
      isValid = false;
    }

    if (eventType === '') {
      document.getElementById('eventTypeError').textContent = 'Select an event type';
      isValid = false;
    }

    if (!isEventSource) {
      if (eventDate === '') {
        document.getElementById('dateError').textContent = 'Select an event date';
        isValid = false;
      }
    }

    if (guests === '' || guests <= 0) {
      document.getElementById('guestsError').textContent = 'Enter a valid number of guests';
      isValid = false;
    }

    if (isValid) {
      alert('Booking submitted successfully!');
      bookingForm.reset();
      const priceDisplay = document.getElementById('totalPrice') || document.getElementById('eventDisplayPrice');
      if (priceDisplay) {
        priceDisplay.textContent = '0';
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("registerForm");

  if (!form) return;

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const dob = document.getElementById("dob");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const phone = document.getElementById("phone");

 name.addEventListener("input", () => {
  const value = name.value.trim();

  if (value === "") {
    document.getElementById("nameError").textContent = "Name is required";
    name.classList.add("error-border");
  } else if (value.length < 9) {
    document.getElementById("nameError").textContent = "Name must be at least 9 characters";
    name.classList.add("error-border");
  } else {
    document.getElementById("nameError").textContent = "";
    name.classList.remove("error-border");
  }
});

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
  if (password.value.length < 8) {
    document.getElementById("passwordError").textContent = "At least 8 characters";
  } else {
    document.getElementById("passwordError").textContent = "";
  }
});

confirmPassword.addEventListener("input", () => {
  if (confirmPassword.value !== password.value) {
    document.getElementById("confirmPasswordError").textContent = "Passwords do not match";
  } else {
    document.getElementById("confirmPasswordError").textContent = "";
  }
});
  phone.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    document.querySelectorAll(".error").forEach(el => el.textContent = "");

    if (name.value.trim() === "") {
      document.getElementById("nameError").textContent = "Name is required";
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

    if (dob.value === "") {
      document.getElementById("dobError").textContent = "Date of birth is required";
      isValid = false;
    }
    const birthDate = new Date(dob.value);
const today = new Date();

let age = today.getFullYear() - birthDate.getFullYear();

let monthDiff = today.getMonth() - birthDate.getMonth();
let dayDiff = today.getDate() - birthDate.getDate();

if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
  age--;
}

if (age < 18) {
  document.getElementById("dobError").textContent = "You must be at least 18 years old";
  isValid = false;
}

    if (password.value.length < 6) {
      document.getElementById("passwordError").textContent = "Password must be at least 6 characters";
      isValid = false;
    }

    if (confirmPassword.value !== password.value) {
      document.getElementById("confirmPasswordError").textContent = "Passwords do not match";
      isValid = false;
    }

    if (!phone.value.startsWith("01")) {
  document.getElementById("phoneError").textContent = "Phone must be Egyptian (starts with 01)";
  isValid = false;
}

if (phone.value.length !== 11) {
  document.getElementById("phoneError").textContent = "Phone must be 11 digits";
  isValid = false;
}

    if (isValid) {
      alert("Registered successfully 🎉");

      const role = document.getElementById("roles").value;

      if (role === "Client") {
        window.location.href = "client-index.html";
      } else if (role === "Organizer") {
        window.location.href = "organizer-index.html";
      } else if (role === "Admin") {
        window.location.href = "admin-index.html";
      }
    }

  });

});



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

  const loginForm = document.getElementById("loginForm");

  if (!loginForm) return;

  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    // clear errors
    document.querySelectorAll("#loginForm .error").forEach(el => el.textContent = "");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // EMAIL validation
    if (email.value.trim() === "") {
      document.getElementById("loginEmailError").textContent = "Email is required";
      isValid = false;
    } 
    else if (!emailPattern.test(email.value)) {
      document.getElementById("loginEmailError").textContent = "Enter a valid email";
      isValid = false;
    }

    // PASSWORD validation
    if (password.value.trim() === "") {
      document.getElementById("loginPasswordError").textContent = "Password is required";
      isValid = false;
    } 
    else if (password.value.length < 8) {
      document.getElementById("loginPasswordError").textContent = "Password must be at least 8 characters";
      isValid = false;
    }

    // SUCCESS
    if (isValid) {
      alert("Login successful 🎉");
      loginForm.reset();
    }

  });

});

// Add Event Form Validation
document.addEventListener("DOMContentLoaded", function () {
  const addEventForm = document.getElementById("form-box");

  if (!addEventForm) return;

  addEventForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    // Clear previous errors
    document.querySelectorAll("#form-box .error").forEach(error => error.textContent = "");

    // Event Image validation
    const imageInput = document.getElementById("image");
    const imageFile = imageInput.files[0];
    if (!imageFile) {
      document.getElementById("imageError").textContent = "Event image is required";
      isValid = false;
    } else if (!imageFile.type.startsWith("image/")) {
      document.getElementById("imageError").textContent = "Only image files are allowed";
      isValid = false;
    }

    // Title validation
    const title = document.getElementById("title").value.trim();
    if (title.length <= 5) {
      document.getElementById("titleError").textContent = "Title must be more than 5 characters";
      isValid = false;
    }

    // Date of Event validation
    const date = document.getElementById("date").value;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (!date) {
      document.getElementById("dateError").textContent = "Date of event is required";
      isValid = false;
    } else if (date <= today) {
      document.getElementById("dateError").textContent = "Date must be in the future";
      isValid = false;
    }

    // Capacity validation
    const capacity = document.getElementById("capacity").value;
    if (!capacity || isNaN(capacity) || capacity <= 0) {
      document.getElementById("capacityError").textContent = "Capacity must be a positive number";
      isValid = false;
    }

    // Location validation
    const location = document.getElementById("location").value.trim();
    if (location.length <= 10) {
      document.getElementById("locationError").textContent = "Location must be more than 10 characters";
      isValid = false;
    }

    // Rules are not required, so no validation

    if (isValid) {
      alert("🎉 Event created successfully! Your event is now live and ready to shine!");
      addEventForm.reset();
    }
  });
});

