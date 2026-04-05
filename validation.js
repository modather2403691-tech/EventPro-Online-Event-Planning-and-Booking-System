const bookingForm = document.getElementById('bookingForm');

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

    if (eventDate === '') {
      document.getElementById('dateError').textContent = 'Select an event date';
      isValid = false;
    }

    if (guests === '' || guests <= 0) {
      document.getElementById('guestsError').textContent = 'Enter a valid number of guests';
      isValid = false;
    }

    if (isValid) {
      alert('Booking submitted successfully!');
      bookingForm.reset();
      document.getElementById('totalPrice').textContent = 500;
    }
  });
}