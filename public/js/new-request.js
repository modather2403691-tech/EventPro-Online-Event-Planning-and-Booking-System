document.addEventListener('DOMContentLoaded', () => {

  const form      = document.getElementById('requestForm');
  const nameInput = document.getElementById('reqName');
  const phoneInput= document.getElementById('reqPhone');
  const typeInput = document.getElementById('reqEventType');
  const dateInput = document.getElementById('reqDate');
  const guestsInput = document.getElementById('reqGuests');

  // ── Numbers only on phone ──
  if (phoneInput) {
    phoneInput.addEventListener('keypress', (e) => {
      if (e.which < 48 || e.which > 57) e.preventDefault();
    });
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '');
    });
  }

  // ── Numbers only on guests ──
  if (guestsInput) {
    guestsInput.addEventListener('keypress', (e) => {
      if (e.which < 48 || e.which > 57) e.preventDefault();
    });
    guestsInput.addEventListener('input', () => {
      guestsInput.value = guestsInput.value.replace(/[^0-9]/g, '');
    });
  }

  // ── Inline live validation ──
  if (nameInput) {
    nameInput.addEventListener('input', () => validateName(false));
  }
  if (phoneInput) {
    phoneInput.addEventListener('input', () => validatePhone(false));
  }

  // ── Auto-fill event type from package details query ──
  const params = new URLSearchParams(window.location.search);
  const packageType = params.get('type');
  const packageTypeMap = {
    party: 'Party',
    wedding: 'Wedding',
    birthday: 'Birthday'
  };

  if (packageType && typeInput) {
    const mappedType = packageTypeMap[packageType.toLowerCase()];
    if (mappedType) {
      typeInput.value = mappedType;
    }
  }

  // ── Submit ──
  if (form) {
    form.addEventListener('submit', (e) => {
      // Clear all errors
      document.querySelectorAll('#requestForm .error')
        .forEach(el => el.textContent = '');

      let valid = true;

      if (!validateName(true))      valid = false;
      if (!validatePhone(true))     valid = false;
      if (!validateEventType(true)) valid = false;
      if (!validateDate(true))      valid = false;
      if (!validateGuests(true))    valid = false;

      if (!valid) e.preventDefault();
    });
  }

  // ── Validators ──

  function validateName(showError) {
    const val = nameInput ? nameInput.value.trim() : '';
    if (val === '') {
      if (showError) setError('nameError', 'Full Name is required.');
      return false;
    }
    if (val.length < 9) {
      if (showError) setError('nameError', 'Name must be at least 9 characters.');
      return false;
    }
    clearError('nameError');
    return true;
  }

  function validatePhone(showError) {
    const val = phoneInput ? phoneInput.value.trim() : '';
    if (val === '') {
      if (showError) setError('phoneError', 'Phone number is required.');
      return false;
    }
    if (!/^\d{11}$/.test(val)) {
      if (showError) setError('phoneError', 'Phone must be exactly 11 digits.');
      return false;
    }
    clearError('phoneError');
    return true;
  }

  function validateEventType(showError) {
    const val = typeInput ? typeInput.value : '';
    if (!val) {
      if (showError) setError('eventTypeError', 'Please select an event type.');
      return false;
    }
    clearError('eventTypeError');
    return true;
  }

  function validateDate(showError) {
    const val = dateInput ? dateInput.value : '';
    if (!val) {
      if (showError) setError('dateError', 'Preferred date is required.');
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(val) < today) {
      if (showError) setError('dateError', 'Date cannot be in the past.');
      return false;
    }
    clearError('dateError');
    return true;
  }

  function validateGuests(showError) {
    const val = guestsInput ? guestsInput.value.trim() : '';
    if (val === '') {
      if (showError) setError('guestsError', 'Number of guests is required.');
      return false;
    }
    if (parseInt(val) < 1) {
      if (showError) setError('guestsError', 'Must be at least 1 guest.');
      return false;
    }
    clearError('guestsError');
    return true;
  }

  function setError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function clearError(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  }

});
