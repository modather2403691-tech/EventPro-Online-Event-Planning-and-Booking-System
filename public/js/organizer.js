document.addEventListener("DOMContentLoaded", () => {
  const total = document.querySelector(".card:nth-child(1) p");
  const upcoming = document.querySelector(".card:nth-child(2) p");
  const completed = document.querySelector(".card:nth-child(3) p");

  if (total && upcoming && completed) {
    const totalBookings = 10;
    const upcomingBookings = 3;
    const completedBookings = 5;

    total.textContent = totalBookings;
    upcoming.textContent = upcomingBookings;
    completed.textContent = completedBookings;
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card p");

  if (cards.length >= 3) {
    const totalPackages = 20;
    const pendingRequests = 3;
    const upcomingEvents = 5;

    cards[0].textContent = totalPackages;
    cards[1].textContent = pendingRequests;
    cards[2].textContent = upcomingEvents;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const requestTable = document.querySelector(".dashboard-table");

  if (!requestTable || !requestTable.querySelector(".request-action-btn")) {
    return;
  }

  const storageKey = "eventpro-booking-request-statuses";
  const priceStorageKey = "eventpro-booking-request-prices";

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

  const loadPrices = () => {
    try {
      return JSON.parse(localStorage.getItem(priceStorageKey)) || {};
    } catch (error) {
      return {};
    }
  };

  const savePrices = prices => {
    try {
      localStorage.setItem(priceStorageKey, JSON.stringify(prices));
    } catch (error) {
      // Ignore storage failures and keep the UI working.
    }
  };

  const getDetailsRow = row => {
    const nextRow = row.nextElementSibling;
    return nextRow && nextRow.classList.contains("request-details-row") ? nextRow : null;
  };

  const getRequestIdFromDetailsRow = detailsRow => {
    if (!detailsRow) {
      return "";
    }

    let row = detailsRow.previousElementSibling;

    while (row && !row.dataset.requestId) {
      row = row.previousElementSibling;
    }

    return row ? row.dataset.requestId : "";
  };

  const setConfirmedPrice = (detailsRow, priceValue) => {
    if (!detailsRow) {
      return;
    }

    const normalizedPrice = String(parseInt(priceValue, 10));
    const priceInput = detailsRow.querySelector(".request-price-input");
    const confirmButton = detailsRow.querySelector(".price-confirm-btn");
    const priceError = detailsRow.querySelector(".price-error");
    const confirmedPriceRow = detailsRow.querySelector(".confirmed-price-row");
    const confirmedPriceValue = detailsRow.querySelector(".confirmed-price-value");

    if (priceInput) {
      priceInput.value = normalizedPrice;
      priceInput.readOnly = true;
    }

    if (confirmButton) {
      confirmButton.textContent = "Confirmed";
      confirmButton.disabled = true;
    }

    if (priceError) {
      priceError.textContent = "";
    }

    if (confirmedPriceValue) {
      confirmedPriceValue.textContent = "$" + Number(normalizedPrice).toLocaleString();
    }

    if (confirmedPriceRow) {
      confirmedPriceRow.hidden = false;
    }

    detailsRow.dataset.priceConfirmed = "true";
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
  const savedPrices = loadPrices();

  requestTable.querySelectorAll("tbody tr[data-request-id]").forEach(row => {
    const requestId = row.dataset.requestId;
    const savedStatus = savedStatuses[requestId] || row.dataset.status || "Pending";

    applyStatus(row, savedStatus);
  });

  requestTable.querySelectorAll(".request-details-row").forEach(detailsRow => {
    const requestId = getRequestIdFromDetailsRow(detailsRow);
    const savedPrice = savedPrices[requestId];

    if (savedPrice && parseInt(savedPrice, 10) > 0) {
      setConfirmedPrice(detailsRow, savedPrice);
    }
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

      if (detailsRow) {
        setConfirmedPrice(detailsRow, priceValue);

        const requestId = getRequestIdFromDetailsRow(detailsRow);
        if (requestId) {
          savedPrices[requestId] = String(parseInt(priceValue, 10));
          savePrices(savedPrices);
        }
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

    // Price validation
    const price = document.getElementById("price").value;
    if (price === "" || isNaN(price) || Number(price) < 0) {
      document.getElementById("priceError").textContent = "Price must be 0 or a positive number";
      isValid = false;
    }

    // Location validation
    const location = document.getElementById("location").value.trim();
    if (location.length <= 10) {
      document.getElementById("locationError").textContent = "Location must be more than 10 characters";
      isValid = false;
    }

    // Rules are not required, so no validation

    if (!isValid) return;

    // Read the image as a base64 data URL, then save the event to the server.
    const reader = new FileReader();
    reader.onload = () => sendEvent(reader.result);
    reader.onerror = () => sendEvent("");
    if (imageFile) {
      reader.readAsDataURL(imageFile);
    } else {
      sendEvent("");
    }

    function sendEvent(imageData) {
      const body = {
        title,
        image: imageData,
        category: document.getElementById("category").value,
        date,
        capacity,
        price,
        location,
        rules: document.getElementById("rules").value.trim()
      };

      fetch("/addevent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Could not create event.");
          alert("🎉 Event created successfully! Your event is now live.");
          window.location.href = "/manage-events";
        })
        .catch((error) => {
          console.error("Create event error:", error);
          alert(error.message || "Unable to create event. Please try again.");
        });
    }
  });
});



