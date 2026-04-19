document.addEventListener("DOMContentLoaded", () => {
  const requestTable = document.querySelector(".dashboard-table");

  if (!requestTable || !requestTable.querySelector(".request-action-btn")) {
    return;
  }

  const storageKey = "eventpro-booking-request-statuses";

  const loadStatuses = () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch (error) {
      return {};
    }
  };

  const saveStatuses = statuses => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(statuses));
    } catch (error) {
      // Ignore storage failures and keep the UI working.
    }
  };

  const getDetailsRow = row => {
    const nextRow = row.nextElementSibling;
    return nextRow && nextRow.classList.contains("request-details-row") ? nextRow : null;
  };

  const applyStatus = (row, status) => {
    const statusCell = row.querySelector(".request-status");
    const buttons = row.querySelectorAll(".request-action-btn");
    const detailsRow = getDetailsRow(row);

    if (!statusCell) {
      return;
    }

    statusCell.textContent = status;
    statusCell.classList.remove("pending", "accepted", "rejected");
    row.dataset.status = status;

    if (status === "Accepted") {
      statusCell.classList.add("accepted");
      if (detailsRow) {
        detailsRow.hidden = false;
      }
    } else if (status === "Rejected") {
      statusCell.classList.add("rejected");
      if (detailsRow) {
        detailsRow.hidden = true;
      }
    } else {
      statusCell.classList.add("pending");
      if (detailsRow) {
        detailsRow.hidden = true;
      }
    }

    buttons.forEach(button => {
      button.disabled = status !== "Pending";
    });
  };

  const savedStatuses = loadStatuses();

  requestTable.querySelectorAll("tbody tr[data-request-id]").forEach(row => {
    const requestId = row.dataset.requestId;
    const savedStatus = savedStatuses[requestId] || row.dataset.status || "Pending";

    applyStatus(row, savedStatus);
  });

  requestTable.querySelectorAll(".request-price-input").forEach(input => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
      if (this.value !== "" && parseInt(this.value, 10) < 1) {
        this.value = "";
      }
      const error = this.closest("p").querySelector(".price-error");
      if (error) error.textContent = "";
    });
  });

  requestTable.addEventListener("click", event => {
    const confirmButton = event.target.closest(".price-confirm-btn");

    if (confirmButton) {
      const detailsRow = confirmButton.closest(".request-details-row");
      const priceInput = detailsRow ? detailsRow.querySelector(".request-price-input") : null;
      const priceError = detailsRow ? detailsRow.querySelector(".price-error") : null;
      const priceValue = priceInput ? priceInput.value.trim() : "";

      if (!priceValue || parseInt(priceValue, 10) <= 0) {
        if (priceError) {
          priceError.textContent = "Enter a positive price, then click Enter.";
        }
        return;
      }

      if (priceError) {
        priceError.textContent = "";
      }
      if (priceInput) {
        priceInput.readOnly = true;
      }
      confirmButton.textContent = "Confirmed";
      confirmButton.disabled = true;
      if (detailsRow) {
        detailsRow.dataset.priceConfirmed = "true";
      }
      return;
    }

    const button = event.target.closest(".request-action-btn");

    if (!button || button.disabled) {
      return;
    }

    const row = button.closest("tr[data-request-id]");

    if (!row) {
      return;
    }

    const requestId = row.dataset.requestId;
    const action = button.dataset.action;
    const nextStatus = action === "accept" ? "Accepted" : "Rejected";

    const detailsRow = getDetailsRow(row);
    const priceInput = detailsRow ? detailsRow.querySelector(".request-price-input") : null;
    const priceError = detailsRow ? detailsRow.querySelector(".price-error") : null;

    if (nextStatus === "Accepted") {
      if (detailsRow && detailsRow.hidden) {
        detailsRow.hidden = false;
      }

      const priceValue = priceInput ? priceInput.value.trim() : "";
      if (!priceValue || parseInt(priceValue, 10) <= 0) {
        if (priceError) {
          priceError.textContent = "Please enter a positive price before accepting.";
        }
        return;
      }

      if (!detailsRow || detailsRow.dataset.priceConfirmed !== "true") {
        if (priceError) {
          priceError.textContent = "Please click Enter to confirm the price first.";
        }
        return;
      }

      if (priceInput) {
        priceInput.readOnly = true;
      }
    }

    savedStatuses[requestId] = nextStatus;
    saveStatuses(savedStatuses);
    applyStatus(row, nextStatus);
  });
});

/* All Admin */
document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("manageUsersTable");
  const tableBody = document.getElementById("manageUsersTableBody");
  const addUserForm = document.getElementById("addUserForm");

  if (!table || !tableBody || !addUserForm || document.body.id !== "manageUsersPage") {
    return;
  }

  const storageKey = "eventpro-admin-users";
  const editableFields = ["status"];
  const defaultUsers = [
    { id: "U001", name: "Sarah Ahmed", email: "sarah@example.com", role: "Client", status: "Active" },
    { id: "U002", name: "Ali Hassan", email: "ali@example.com", role: "Organizer", status: "Active" },
    { id: "U003", name: "Admin User", email: "admin@example.com", role: "Admin", status: "Active" }
  ];

  const loadUsers = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(saved) && saved.length ? saved : defaultUsers;
    } catch (error) {
      return defaultUsers;
    }
  };

  const saveUsers = users => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(users));
    } catch (error) {
      // Keep UI functional even if storage is unavailable.
    }
  };

  const escapeHtml = value => {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const createRowHtml = user => {
    return '<tr data-user-id="' + escapeHtml(user.id) + '">' +
      '<td>' + escapeHtml(user.id) + '</td>' +
      '<td data-field="name">' + escapeHtml(user.name) + '</td>' +
      '<td data-field="email">' + escapeHtml(user.email) + '</td>' +
      '<td data-field="role">' + escapeHtml(user.role) + '</td>' +
      '<td data-field="status">' + escapeHtml(user.status) + '</td>' +
      '<td class="user-actions-cell">' +
      '<button type="button" class="user-action-btn user-edit-btn">Edit Status</button>' +
      '<button type="button" class="user-action-btn user-save-btn is-hidden">Save</button>' +
      '<button type="button" class="user-action-btn user-cancel-btn is-hidden">Cancel</button>' +
      '<button type="button" class="user-action-btn user-delete-btn">Delete</button>' +
      '</td>' +
      '</tr>';
  };

  const renderTable = users => {
    tableBody.innerHTML = users.map(createRowHtml).join("");
  };

  const getCurrentUsers = () => {
    const rows = tableBody.querySelectorAll("tr[data-user-id]");

    return Array.from(rows).map(row => ({
      id: row.dataset.userId,
      name: row.querySelector('[data-field="name"]').textContent.trim(),
      email: row.querySelector('[data-field="email"]').textContent.trim(),
      role: row.querySelector('[data-field="role"]').textContent.trim(),
      status: row.querySelector('[data-field="status"]').textContent.trim()
    }));
  };

  const setButtonsState = (row, isEditing) => {
    row.querySelector(".user-edit-btn").classList.toggle("is-hidden", isEditing);
    row.querySelector(".user-save-btn").classList.toggle("is-hidden", !isEditing);
    row.querySelector(".user-cancel-btn").classList.toggle("is-hidden", !isEditing);
    row.querySelector(".user-delete-btn").classList.toggle("is-hidden", isEditing);
  };

  const setEditingMode = (row, isEditing) => {
    const originalValues = {};

    editableFields.forEach(field => {
      const cell = row.querySelector('[data-field="' + field + '"]');

      if (!cell) {
        return;
      }

      if (isEditing) {
        const originalValue = cell.textContent.trim();
        originalValues[field] = originalValue;

        if (field === "role" || field === "status") {
          const options = field === "role"
            ? ["Client", "Organizer", "Admin"]
            : ["Active", "Inactive"];
          const select = document.createElement("select");
          select.className = "user-edit-input";

          options.forEach(optionValue => {
            const option = document.createElement("option");
            option.value = optionValue;
            option.textContent = optionValue;
            if (optionValue === originalValue) {
              option.selected = true;
            }
            select.appendChild(option);
          });

          cell.textContent = "";
          cell.appendChild(select);
        } else {
          const input = document.createElement("input");
          input.type = field === "email" ? "email" : "text";
          input.className = "user-edit-input";
          input.value = originalValue;
          cell.textContent = "";
          cell.appendChild(input);
        }
      } else {
        const control = cell.querySelector("input, select");

        if (!control) {
          return;
        }

        cell.textContent = control.value.trim();
      }
    });

    if (isEditing) {
      row.dataset.originalRow = JSON.stringify(originalValues);
    }

    row.classList.toggle("is-editing", isEditing);
    setButtonsState(row, isEditing);
  };

  renderTable(loadUsers());

  table.addEventListener("click", function (event) {
    const row = event.target.closest("tr");

    if (!row) {
      return;
    }

    if (event.target.classList.contains("user-edit-btn")) {
      setEditingMode(row, true);
      return;
    }

    if (event.target.classList.contains("user-save-btn")) {
      setEditingMode(row, false);
      saveUsers(getCurrentUsers());
      return;
    }

    if (event.target.classList.contains("user-cancel-btn")) {
      let originalValues = {};

      try {
        originalValues = JSON.parse(row.dataset.originalRow || "{}");
      } catch (error) {
        originalValues = {};
      }

      editableFields.forEach(field => {
        const cell = row.querySelector('[data-field="' + field + '"]');

        if (!cell) {
          return;
        }

        cell.textContent = originalValues[field] || cell.textContent.trim();
      });

      row.classList.remove("is-editing");
      setButtonsState(row, false);
      return;
    }

    if (event.target.classList.contains("user-delete-btn")) {
      const userId = row.dataset.userId;

      if (!confirm("Delete user " + userId + "?")) {
        return;
      }

      row.remove();
      saveUsers(getCurrentUsers());
    }
  });

  const idInput = document.getElementById("newUserId");
  const nameInput = document.getElementById("newUserName");
  const emailInput = document.getElementById("newUserEmail");
  const roleInput = document.getElementById("newUserRole");
  const statusInput = document.getElementById("newUserStatus");
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
      if (nameInput.value.trim().length > 0 && nameInput.value.trim().length < 10) {
        nameError.textContent = "Name must be more than 9 characters.";
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
    event.preventDefault();

    if (idError) idError.textContent = "";
    if (nameError) nameError.textContent = "";
    if (emailError) emailError.textContent = "";

    const newUser = {
      id: idInput.value.trim().toUpperCase(),
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      role: roleInput.value,
      status: statusInput.value
    };

    let isValid = true;

    if (!newUser.id) {
      if (idError) idError.textContent = "User ID is required.";
      isValid = false;
    }

    if (!newUser.name) {
      if (nameError) nameError.textContent = "Name is required.";
      isValid = false;
    } else if (newUser.name.length < 10) {
      if (nameError) nameError.textContent = "Name must be more than 9 characters.";
      isValid = false;
    }

    if (!newUser.email) {
      if (emailError) emailError.textContent = "Email is required.";
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    if (!newUser.email.includes("@")) {
      if (emailError) emailError.textContent = 'Email must include "@".';
      return;
    }

    const users = getCurrentUsers();
    const duplicate = users.some(user => user.id.toUpperCase() === newUser.id);
    const normalizedEmail = newUser.email.toLowerCase();
    const duplicateEmail = users.some(user => user.email.toLowerCase() === normalizedEmail);

    if (duplicate) {
      if (idError) idError.textContent = "User ID already exists. Please use a different ID.";
      return;
    }

    if (duplicateEmail) {
      if (emailError) emailError.textContent = "Email already exists. Please use a different email.";
      return;
    }

    users.push(newUser);
    saveUsers(users);
    renderTable(users);
    addUserForm.reset();
  });
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
    } catch (error) {
      // Keep UI functional if storage is unavailable.
    }
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

      if (!cell) {
        return;
      }

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
            if (optionValue === originalValue) {
              option.selected = true;
            }
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

        if (!control) {
          return;
        }

        cell.textContent = control.value.trim();
      }
    });

    if (isEditing) {
      row.dataset.originalRow = JSON.stringify(originalValues);
    }

    row.classList.toggle("is-editing", isEditing);
    setButtonsState(row, isEditing);
  };

  renderTable(loadEvents());

  table.addEventListener("click", function (event) {
    const row = event.target.closest("tr");

    if (!row) {
      return;
    }

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

        if (!cell) {
          return;
        }

        cell.textContent = originalValues[field] || cell.textContent.trim();
      });

      row.classList.remove("is-editing");
      setButtonsState(row, false);
      return;
    }

    if (event.target.classList.contains("event-remove-btn")) {
      const eventId = row.querySelector('[data-field="eventId"]').textContent.trim();

      if (!confirm("Remove event " + eventId + "?")) {
        return;
      }

      row.remove();
      saveEvents(getCurrentEvents());
    }
  });
});
 

document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("admin-page")) {
    return;
  }

  const usersValue = document.getElementById("cardUsersValue");
  const bookingsValue = document.getElementById("cardBookingsValue");
  const pendingValue = document.getElementById("cardPendingValue");

  if (!usersValue || !bookingsValue || !pendingValue) {
    return;
  }

  usersValue.textContent = "42";
  bookingsValue.textContent = "18";
  pendingValue.textContent = "6";
});
