//admin
document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("manageUsersTable");
  const tableBody = document.getElementById("manageUsersTableBody");
  const addUserForm = document.getElementById("addUserForm");

  if (!table || !tableBody || !addUserForm || document.body.id !== "manageUsersPage") {
    return;
  }

  // Frontend Form Validation (Backend will handle the actual saving)
  const idInput = document.getElementById("newUserId");
  const nameInput = document.getElementById("newUserName");
  const emailInput = document.getElementById("newUserEmail");
  const idError = document.getElementById("newUserIdError");
  const nameError = document.getElementById("newUserNameError");
  const emailError = document.getElementById("newUserEmailError");

  if (idInput && idError) {
    idInput.addEventListener("input", function () {
      idError.textContent = "";
    });
  }

  if (nameInput && nameError) {
    nameInput.addEventListener("input", function () {
      if (nameInput.value.trim().length > 0 && nameInput.value.trim().length < 3) {
        nameError.textContent = "Name must be at least 3 characters.";
        return;
      }
      nameError.textContent = "";
    });
  }

  if (emailInput && emailError) {
    emailInput.addEventListener("input", function () {
      emailError.textContent = "";
    });
  }

  addUserForm.addEventListener("submit", function (event) {
    let isValid = true;

    if (idError) idError.textContent = "";
    if (nameError) nameError.textContent = "";
    if (emailError) emailError.textContent = "";

    const emailValue = emailInput.value.trim();
    const nameValue = nameInput.value.trim();

    if (nameValue.length > 0 && nameValue.length < 3) {
      if (nameError) nameError.textContent = "Name must be at least 3 characters.";
      isValid = false;
    }

    if (!emailValue.includes("@")) {
      if (emailError) emailError.textContent = 'Email must include "@".';
      isValid = false;
    }

    // Only prevent form submission if validation fails
    // If it passes, the form will naturally POST to your Express backend!
    if (!isValid) {
      event.preventDefault(); 
    }
  });

  // Basic UI visual removal for delete button (Requires backend route to actually delete from DB)
  table.addEventListener("click", function (event) {
    const row = event.target.closest("tr");
    if (!row) return;

    // Start editing a user row
    if (event.target.classList.contains("user-edit-btn")) {
      enterUserEditMode(row);
      return;
    }

    // Save edited user
    if (event.target.classList.contains("user-save-btn")) {
      saveUserEdits(row);
      return;
    }

    // Cancel editing
    if (event.target.classList.contains("user-cancel-btn")) {
      cancelUserEdits(row);
      return;
    }

    if (event.target.classList.contains("user-delete-btn")) {
      if (!confirm("Are you sure you want to delete this user?")) {
        return;
      }
      // For now remove from UI; backend deletion not implemented
      row.remove();
    }
  });

  function enterUserEditMode(row) {
    if (!row) return;
    row.classList.add('is-editing');
    // toggle buttons
    toggleUserButtons(row, true);

    // make editable fields
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
        // try to parse existing date
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

      if (!res.ok || !data.success) throw new Error((data && data.message) || ('Save failed (status ' + res.status + ')'));

      // update UI with returned values
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
    // restore text from inputs without saving
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

// =========================================================
// ADMIN DASHBOARD BUTTONS
// =========================================================
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

// =========================================================
// ORGANIZER EVENT PAGE LOGIC (Kept exactly as you had it)
// =========================================================
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

// =========================================================
// DASHBOARD STATS LOGIC
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("admin-page")) {
    return;
  }
});