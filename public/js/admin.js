
document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("manageUsersTable");
  const tableBody = document.getElementById("manageUsersTableBody");
  const addUserForm = document.getElementById("addUserForm");

  if (!table || !tableBody || !addUserForm || document.body.id !== "manageUsersPage") {
    return;
  }

 
  const idInput = document.getElementById("newUserId");
  const nameInput = document.getElementById("newUserName");
  const emailInput = document.getElementById("newUserEmail");
  const idError = document.getElementById("newUserIdError");
  const nameError = document.getElementById("newUserNameError");
  const emailError = document.getElementById("newUserEmailError");
  const passwordInput = document.getElementById("newUserPassword");
  const passwordError = document.getElementById("newUserPasswordError");
  const phoneInput = document.getElementById("newUserPhone");
  const phoneError = document.getElementById("newUserPhoneError");
  const dobInput = document.getElementById("newUserDob");
  const dobError = document.getElementById("newUserDobError");

  const clearError = (element) => {
    if (element) {
      element.textContent = "";
    }
  };

  const setError = (element, message) => {
    if (element) {
      element.textContent = message;
    }
  };

  const calculateAge = (value) => {
    if (!value) {
      return NaN;
    }

    const dobDate = new Date(value);
    if (Number.isNaN(dobDate.getTime())) {
      return NaN;
    }

    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    return age;
  };

  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateName = () => {
    const value = nameInput ? nameInput.value.trim() : "";
    if (!value) {
      clearError(nameError);
      return;
    }

    if (value.length < 9) {
      setError(nameError, "Name must be at least 9 characters.");
      return;
    }

    clearError(nameError);
  };

  const validateEmail = () => {
    const value = emailInput ? emailInput.value.trim() : "";
    if (!value) {
      setError(emailError, "Email is required.");
      return;
    }

    if (!emailPattern.test(value)) {
      setError(emailError, "Enter a valid email address.");
      return;
    }

    clearError(emailError);
  };

  const validatePassword = () => {
    const value = passwordInput ? passwordInput.value : "";
    if (!value) {
      setError(passwordError, "Password is required.");
      return;
    }

    if (!passwordPattern.test(value)) {
      setError(passwordError, "Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character.");
      return;
    }

    clearError(passwordError);
  };

  const validatePhone = () => {
    const value = phoneInput ? phoneInput.value.trim() : "";
    if (!value) {
      setError(phoneError, "Phone number is required.");
      return;
    }

    if (!value.startsWith("01")) {
      setError(phoneError, "Phone must start with 01.");
      return;
    }

    clearError(phoneError);
  };

  const validateDob = () => {
    const value = dobInput ? dobInput.value : "";
    if (!value) {
      setError(dobError, "Date of birth is required.");
      return;
    }

    const age = calculateAge(value);
    if (Number.isNaN(age) || age < 18) {
      setError(dobError, "User must be 18 years or older.");
      return;
    }

    clearError(dobError);
  };

  if (idInput && idError) {
    idInput.addEventListener("input", function () {
      clearError(idError);
    });
  }

  if (nameInput && nameError) {
    nameInput.addEventListener("input", function () {
      validateName();
    });
  }

  if (emailInput && emailError) {
    emailInput.addEventListener("input", function () {
      validateEmail();
    });

    emailInput.addEventListener("blur", function () {
      validateEmail();
    });
  }

  if (passwordInput && passwordError) {
    passwordInput.addEventListener("input", function () {
      validatePassword();
    });

    passwordInput.addEventListener("blur", function () {
      validatePassword();
    });
  }

  if (phoneInput && phoneError) {
    phoneInput.addEventListener("input", function () {
      validatePhone();
    });

    phoneInput.addEventListener("blur", function () {
      validatePhone();
    });
  }

  if (dobInput && dobError) {
    dobInput.addEventListener("input", function () {
      validateDob();
    });

    dobInput.addEventListener("change", function () {
      validateDob();
    });

    dobInput.addEventListener("blur", function () {
      validateDob();
    });
  }

  addUserForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const valueId = idInput ? idInput.value.trim() : "";
    const nameValue = nameInput ? nameInput.value.trim() : "";
    const emailValue = emailInput ? emailInput.value.trim() : "";
    const passwordValue = passwordInput ? passwordInput.value : "";
    const phoneValue = phoneInput ? phoneInput.value.trim() : "";
    const dobValue = dobInput ? dobInput.value : "";

   
    [idError, nameError, emailError, passwordError, phoneError, dobError].forEach(clearError);

    let isValid = true;

   
    if (!valueId) {
      setError(idError, 'User ID is required.');
      isValid = false;
    }


    validateName();
    if (nameValue.length < 9) {
      setError(nameError, 'Name must be at least 9 characters.');
      isValid = false;
    }

    
    validateEmail();
    if (!emailValue) {
      setError(emailError, 'Email is required.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError(emailError, 'Enter a valid email address.');
      isValid = false;
    }

   
    validatePassword();
    if (!passwordValue) {
      setError(passwordError, 'Password is required.');
      isValid = false;
    } else if (!passwordPattern.test(passwordValue)) {
      setError(passwordError, 'Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character.');
      isValid = false;
    }

    
    validatePhone();
    if (!phoneValue) {
      setError(phoneError, 'Phone number is required.');
      isValid = false;
    } else if (!phoneValue.startsWith('01')) {
      setError(phoneError, 'Phone must start with 01.');
      isValid = false;
    }

   
    validateDob();
    if (!dobValue) {
      setError(dobError, 'Date of birth is required.');
      isValid = false;
    } else {
      const age = calculateAge(dobValue);
      if (Number.isNaN(age) || age < 18) {
        setError(dobError, 'User must be 18 years or older.');
        isValid = false;
      }
    }

   
    if (valueId && isValid) {
      try {
        const res = await fetch('/admin/users/check-id?userId=' + encodeURIComponent(valueId), {
          headers: {
            Accept: 'application/json'
          }
        });
        if (res.ok) {
          const js = await res.json();
          if (js.exists) {
            setError(idError, 'This User ID is already taken.');
            isValid = false;
          }
        }
      } catch (err) {
      
        console.warn('ID uniqueness check failed', err);
      }
    }

    if (isValid) {
      try {
        const payload = Object.fromEntries(new FormData(addUserForm).entries());
        const response = await fetch(addUserForm.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
          const fieldErrors = result.fieldErrors || {};
          if (fieldErrors.userId) setError(idError, fieldErrors.userId);
          if (fieldErrors.name) setError(nameError, fieldErrors.name);
          if (fieldErrors.email) setError(emailError, fieldErrors.email);
          if (fieldErrors.password) setError(passwordError, fieldErrors.password);
          if (fieldErrors.phone) setError(phoneError, fieldErrors.phone);
          if (fieldErrors.dob) setError(dobError, fieldErrors.dob);

          if (!Object.keys(fieldErrors).length && result.message) {
            alert(result.message);
          }
          return;
        }

        window.location.reload();
      } catch (error) {
        alert('Unable to save user. Please try again.');
      }
    }
  });

 
  table.addEventListener("click", function (event) {
    const row = event.target.closest("tr");
    if (!row) return;

    
    if (event.target.classList.contains("user-edit-btn")) {
      enterUserEditMode(row);
      return;
    }

  
    if (event.target.classList.contains("user-save-btn")) {
      saveUserEdits(row);
      return;
    }

   
    if (event.target.classList.contains("user-cancel-btn")) {
      cancelUserEdits(row);
      return;
    }

    if (event.target.classList.contains("user-delete-btn")) {
      if (!confirm("Are you sure you want to delete this user?")) {
        return;
      }
    
      row.remove();
    }
  });

  function enterUserEditMode(row) {
    if (!row) return;
    row.classList.add('is-editing');
   
    toggleUserButtons(row, true);

   
    ['name','email','phone','dob','role','status'].forEach(field => {
      const cell = row.querySelector('[data-field="' + field + '"]');
      if (!cell) return;
      const text = cell.textContent.trim();
      let input;
      if (field === 'role' || field === 'status') {
        input = document.createElement('select');
        input.className = 'user-edit-input';
        if (field === 'role') {
          ['Client','Organizer','Admin'].forEach(opt => {
            const o = document.createElement('option'); o.value = opt; o.textContent = opt; if (opt === text) o.selected = true; input.appendChild(o);
          });
        } else {
          ['Active','Inactive'].forEach(opt => { const o = document.createElement('option'); o.value = opt; o.textContent = opt; if (opt === text) o.selected = true; input.appendChild(o); });
        }
      } else if (field === 'dob') {
        input = document.createElement('input'); input.type = 'date'; input.className = 'user-edit-input';
        
        const d = new Date(text);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0'); input.value = yyyy + '-' + mm + '-' + dd;
        }
      } else {
        input = document.createElement('input'); input.type = 'text'; input.className = 'user-edit-input'; input.value = text;
      }
      cell.textContent = '';
      cell.appendChild(input);
    });
  }

  function toggleUserButtons(row, editing) {
    row.querySelector('.user-edit-btn').classList.toggle('is-hidden', editing);
    row.querySelector('.user-delete-btn').classList.toggle('is-hidden', editing);
    row.querySelector('.user-save-btn').classList.toggle('is-hidden', !editing);
    row.querySelector('.user-cancel-btn').classList.toggle('is-hidden', !editing);
  }

  async function saveUserEdits(row) {
    const id = row.getAttribute('data-user-id');
    if (!id) return alert('Missing user id');
    const payload = { _id: id };
    ['name','email','phone','dob','role','status'].forEach(field => {
      const cell = row.querySelector('[data-field="' + field + '"]');
      if (!cell) return;
      const control = cell.querySelector('input, select');
      payload[field] = control ? control.value.trim() : cell.textContent.trim();
    });

    if (payload.name && payload.name.length < 9) {
      alert('Name must be at least 9 characters.');
      return;
    }

    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      alert('Enter a valid email address.');
      return;
    }

    if (payload.phone && !payload.phone.startsWith('01')) {
      alert('Phone must start with 01.');
      return;
    }

    if (payload.dob) {
      const dobDate = new Date(payload.dob);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      if (Number.isNaN(dobDate.getTime()) || age < 18) {
        alert('User must be 18 years or older.');
        return;
      }
    }

    try {
      const res = await fetch('/admin/users/edit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const contentType = res.headers.get('content-type') || '';
      const raw = await res.text();
      let data = null;

      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(raw);
        } catch (parseError) {
          throw new Error('Server sent invalid JSON: ' + parseError.message);
        }
      } else {
        throw new Error('Server returned non-JSON response (status ' + res.status + '): ' + raw.slice(0, 180));
      }

      if (data.fieldErrors) {
        const firstError = data.fieldErrors.name || data.fieldErrors.email || data.fieldErrors.phone || data.fieldErrors.dob;
        throw new Error(firstError || 'Validation failed');
      }

      if (!res.ok || !data.success) throw new Error((data && data.message) || ('Save failed (status ' + res.status + ')'));

    
      ['name','email','phone','dob','role','status'].forEach(field => {
        const cell = row.querySelector('[data-field="' + field + '"]');
        if (!cell) return;
        let val = payload[field] || '';
        if (field === 'dob') {
          const d = new Date(val);
          val = isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
        }
        cell.textContent = val;
      });
      row.classList.remove('is-editing');
      toggleUserButtons(row, false);
    } catch (err) {
      alert('Unable to save: ' + err.message);
    }
  }

  function cancelUserEdits(row) {
    
    ['name','email','phone','dob','role','status'].forEach(field => {
      const cell = row.querySelector('[data-field="' + field + '"]');
      if (!cell) return;
      const control = cell.querySelector('input, select');
      if (control) {
        const val = control.getAttribute('value') || control.value || '';
        if (field === 'dob' && val) {
          const d = new Date(val); cell.textContent = isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
        } else {
          cell.textContent = val || control.value || '';
        }
      }
    });
    row.classList.remove('is-editing');
    toggleUserButtons(row, false);
  }
});


document.addEventListener("DOMContentLoaded", function () {
  const generateReportButton = document.getElementById("btnGenerateReport");
  const exportCsvButton = document.getElementById("btnExportCsv");

  if (generateReportButton) {
    generateReportButton.addEventListener("click", function () {
      window.location.href = generateReportButton.dataset.target || "/reports";
    });
  }

  if (exportCsvButton) {
    exportCsvButton.addEventListener("click", function () {
      window.location.href = exportCsvButton.dataset.target || "/admin-dashboard/export-csv";
    });
  }
});


document.addEventListener("DOMContentLoaded", function () {
  if (document.body.id !== "organizerEventPage") {
    return;
  }

  const table = document.getElementById("organizerEventsTable");
  const tableBody = document.getElementById("organizerEventsTableBody");

  if (!table || !tableBody) {
    return;
  }

  const storageKey = "eventpro-admin-organizer-events";
  const editableFields = ["eventId", "eventTitle", "organizer", "eventDate", "guests", "availability"];

  const defaultEvents = [
    { eventId: "EV-501", eventTitle: "Founders Live Cairo", organizer: "Noor Hassan", eventDate: "2026-05-12", guests: "220", availability: "Available" },
    { eventId: "EV-502", eventTitle: "Investors Founders Meetup", organizer: "Ahmed Nasser", eventDate: "2026-05-20", guests: "140", availability: "Available" },
    { eventId: "EV-503", eventTitle: "Women Conference 2026", organizer: "Mariam Adel", eventDate: "2026-06-04", guests: "95", availability: "Limited" },
    { eventId: "EV-504", eventTitle: "AI Conference Egypt", organizer: "Fady Khalil", eventDate: "2026-06-18", guests: "160", availability: "Available" }
  ];

  const loadEvents = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(saved) && saved.length ? saved : defaultEvents;
    } catch (error) {
      return defaultEvents;
    }
  };

  const saveEvents = events => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(events));
    } catch (error) { }
  };

  const escapeHtml = value => {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const createRowHtml = event => {
    return '<tr>' +
      '<td data-field="eventId">' + escapeHtml(event.eventId) + '</td>' +
      '<td data-field="eventTitle">' + escapeHtml(event.eventTitle) + '</td>' +
      '<td data-field="organizer">' + escapeHtml(event.organizer) + '</td>' +
      '<td data-field="eventDate">' + escapeHtml(event.eventDate) + '</td>' +
      '<td data-field="guests">' + escapeHtml(event.guests) + '</td>' +
      '<td data-field="availability">' + escapeHtml(event.availability) + '</td>' +
      '<td class="organizer-event-actions-cell">' +
      '<button type="button" class="event-action-btn event-edit-btn">Edit</button>' +
      '<button type="button" class="event-action-btn event-save-btn is-hidden">Save</button>' +
      '<button type="button" class="event-action-btn event-cancel-btn is-hidden">Cancel</button>' +
      '<button type="button" class="event-action-btn event-remove-btn">Remove</button>' +
      '</td>' +
      '</tr>';
  };

  const renderTable = events => {
    tableBody.innerHTML = events.map(createRowHtml).join("");
  };

  const getCurrentEvents = () => {
    const rows = tableBody.querySelectorAll("tr");
    return Array.from(rows).map(row => ({
      eventId: row.querySelector('[data-field="eventId"]').textContent.trim(),
      eventTitle: row.querySelector('[data-field="eventTitle"]').textContent.trim(),
      organizer: row.querySelector('[data-field="organizer"]').textContent.trim(),
      eventDate: row.querySelector('[data-field="eventDate"]').textContent.trim(),
      guests: row.querySelector('[data-field="guests"]').textContent.trim(),
      availability: row.querySelector('[data-field="availability"]').textContent.trim()
    }));
  };

  const setButtonsState = (row, isEditing) => {
    row.querySelector(".event-edit-btn").classList.toggle("is-hidden", isEditing);
    row.querySelector(".event-save-btn").classList.toggle("is-hidden", !isEditing);
    row.querySelector(".event-cancel-btn").classList.toggle("is-hidden", !isEditing);
    row.querySelector(".event-remove-btn").classList.toggle("is-hidden", isEditing);
  };

  const setEditingMode = (row, isEditing) => {
    const originalValues = {};
    editableFields.forEach(field => {
      const cell = row.querySelector('[data-field="' + field + '"]');
      if (!cell) return;

      if (isEditing) {
        const originalValue = cell.textContent.trim();
        originalValues[field] = originalValue;

        if (field === "availability") {
          const options = ["Available", "Limited", "Unavailable"];
          const select = document.createElement("select");
          select.className = "event-edit-input";
          options.forEach(optionValue => {
            const option = document.createElement("option");
            option.value = optionValue;
            option.textContent = optionValue;
            if (optionValue === originalValue) option.selected = true;
            select.appendChild(option);
          });
          cell.textContent = "";
          cell.appendChild(select);
          return;
        }

        const input = document.createElement("input");
        input.className = "event-edit-input";
        if (field === "eventDate") {
          input.type = "date";
          input.value = originalValue;
        } else if (field === "guests") {
          input.type = "number";
          input.min = "1";
          input.value = originalValue;
        } else {
          input.type = "text";
          input.value = originalValue;
        }
        cell.textContent = "";
        cell.appendChild(input);
      } else {
        const control = cell.querySelector("input, select");
        if (!control) return;
        cell.textContent = control.value.trim();
      }
    });

    if (isEditing) {
      row.dataset.originalRow = JSON.stringify(originalValues);
    }
    row.classList.toggle("is-editing", isEditing);
    setButtonsState(row, isEditing);
  };

  const initialEvents = getCurrentEvents();
  if (initialEvents.length > 0) {
    saveEvents(initialEvents);
  } else {
    renderTable(loadEvents());
  }

  table.addEventListener("click", function (event) {
    const row = event.target.closest("tr");
    if (!row) return;

    if (event.target.classList.contains("event-edit-btn")) {
      setEditingMode(row, true);
      return;
    }

    if (event.target.classList.contains("event-save-btn")) {
      setEditingMode(row, false);
      saveEvents(getCurrentEvents());
      return;
    }

    if (event.target.classList.contains("event-cancel-btn")) {
      let originalValues = {};
      try {
        originalValues = JSON.parse(row.dataset.originalRow || "{}");
      } catch (error) {
        originalValues = {};
      }
      editableFields.forEach(field => {
        const cell = row.querySelector('[data-field="' + field + '"]');
        if (!cell) return;
        cell.textContent = originalValues[field] || cell.textContent.trim();
      });
      row.classList.remove("is-editing");
      setButtonsState(row, false);
      return;
    }

    if (event.target.classList.contains("event-remove-btn")) {
      const eventId = row.querySelector('[data-field="eventId"]').textContent.trim();
      if (!confirm("Remove event " + eventId + "?")) return;
      row.remove();
      saveEvents(getCurrentEvents());
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("admin-page")) {
    return;
  }
});