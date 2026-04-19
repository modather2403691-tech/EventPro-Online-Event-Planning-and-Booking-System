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



const packages = {
  wedding: {
    title: "Wedding Package",
    desc: "Elegant wedding setup including decoration, catering, and photography.",
    price: "$500",
    services: ["Venue Decoration", "Catering Service", "Photography", "Music & DJ"],
    addons: [
      { name: "Extra Decoration", price: 100 },
      { name: "Premium Catering", price: 150 },
      { name: "Videography", price: 120 }
    ],
    video: "assets/videos/wedding.mp4"
  },

  birthday: {
    title: "Birthday Package",
    desc: "Fun birthday setup with music, cake, and decorations.",
    price: "$300",
    services: ["DJ & Music", "Cake", "Decor"],
    addons: [
      { name: "Extra Balloons", price: 50 },
      { name: "Photobooth", price: 70 }
    ],
    video: "assets/videos/birthday.mp4"
  },

  party: {
    title: "Party Package",
    desc: "Enjoy a vibrant party setup with music, lighting, decoration, and catering.",
    price: "$350",
    services: ["DJ & Music", "Lighting Effects", "Decoration", "Catering"],
    addons: [
      { name: "Extra Lighting", price: 80 },
      { name: "Live DJ", price: 120 },
      { name: "Photo Booth", price: 100 }
    ],
    video: "assets/videos/party.mp4"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "wedding";
  const pkg = packages[type];

  if (!pkg) return;

  const titleEl = document.getElementById("package-title");
  const descEl = document.getElementById("package-desc");
  const priceEl = document.getElementById("package-price");
  const servicesEl = document.getElementById("package-services");
  const addonsEl = document.getElementById("package-addons");
  const bookBtn = document.getElementById("book-btn");

  if (titleEl) titleEl.innerText = pkg.title;
  if (descEl) descEl.innerText = pkg.desc;
  if (priceEl) priceEl.innerText = pkg.price;

  if (servicesEl) {
    servicesEl.innerHTML = "";
    pkg.services.forEach(service => {
      const li = document.createElement("li");
      li.innerText = service;
      servicesEl.appendChild(li);
    });
  }

  if (addonsEl) {
    addonsEl.innerHTML = "";
    pkg.addons.forEach(addon => {
      const li = document.createElement("li");
      li.innerText = addon.name; // Ahmed Fares - Removed price display
      addonsEl.appendChild(li);
    });
  }

  const videoSource = document.getElementById("bg-video-source");
  const video = document.getElementById("bg-video");

  if (videoSource && video) {
    videoSource.src = pkg.video;
    video.load();
  }

  if (bookBtn) {
    bookBtn.onclick = () => {
      window.location.href = `book-event.html?source=package&type=${type}`;
    };
  }
});



document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const roleSelect = document.querySelector("select");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const selectedRole = roleSelect.value;

    if (selectedRole === "Client") {
      window.location.href = "client-index.html";
    } else if (selectedRole === "Organizer") {
      window.location.href = "organizer-index.html";
    } else if (selectedRole === "Admin") {
      window.location.href = "admin-index.html";
    } else {
      alert("Please select a role.");
    }
  });
});

/*validation of admin in login page */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".auth-form") || document.querySelector("form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "modather@gmail.com" && password === "Mody1234") {
      window.location.href = "admin-index.html";
    } 
     else if (email === "client@gmail.com" && password === "Mody1234") {
      window.location.href = "client-index.html";
    } 
     else if (email === "organizer@gmail.com" && password === "Mody1234") {
      window.location.href = "organizer-index.html";
    } 
    else {
      alert("Invalid  email or password.");
    }
  });
});

/*book event*/
  const guestsSection = document.getElementById("guestsSection");
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const source = params.get("source");
  const type = params.get("type");
  const event = params.get("event");
  const price = params.get("price");

  const eventTypeInput = document.getElementById("eventType");
  const additionalServicesSection = document.getElementById("additionalServicesSection");
  const totalPriceSection = document.getElementById("totalPriceSection");
  const totalPrice = document.getElementById("totalPrice");


  if (!eventTypeInput) return;

  if (source === "package" && type && packages[type]) {
    const pkg = packages[type];
    eventTypeInput.value = pkg.title.replace(" Package", "");

    if (additionalServicesSection) {
      additionalServicesSection.style.display = "block";
    }

    if (totalPriceSection) {
      totalPriceSection.style.display = "block";
    }

    if (totalPrice) {
      totalPrice.textContent = parseInt(pkg.price.replace("$", ""));
    }
  }

  if (source === "event" && event) {
    eventTypeInput.value = event;

    if (additionalServicesSection) {
      additionalServicesSection.style.display = "none";
    }

    if (totalPriceSection) {
      totalPriceSection.style.display = "block";
    }

    if (totalPrice) {
      totalPrice.textContent = price || "0";
    }
      if (guestsSection) {
    guestsSection.style.display = "none";
  }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const source = params.get("source");
  const type = params.get("type");
  const eventTitle = params.get("event");

  const eventTypeSelect = document.getElementById("eventType");
  const eventTypeText = document.getElementById("eventTypeText");
  const additionalServicesSection = document.getElementById("additionalServicesSection");
  const additionalServicesList = document.getElementById("additionalServicesList");

  if (source === "package" && type && packages[type]) {
    const pkg = packages[type];

    if (eventTypeSelect) {
      eventTypeSelect.hidden = false;
      eventTypeSelect.disabled = false;
      eventTypeSelect.value = pkg.title.replace(" Package", "");
    }

    if (eventTypeText) {
      eventTypeText.hidden = true;
    }

    if (additionalServicesSection) {
      additionalServicesSection.style.display = "block";
    }
     if (guestsSection) {
    guestsSection.style.display = "block";
  }

    if (additionalServicesList) {
      additionalServicesList.innerHTML = "";

      pkg.addons.forEach(addon => {
        const label = document.createElement("label");
        label.innerHTML = `
          <input type="checkbox" class="service";
          ${addon.name};
        `;
        additionalServicesList.appendChild(label);
      });

      setupPriceCalculation(parseInt(pkg.price.replace("$", "")));
    }
  }

  if (source === "event" && eventTitle) {
    if (eventTypeSelect) {
      if (eventTypeText) {
        eventTypeSelect.hidden = true;
        eventTypeSelect.disabled = true;
      } else {
        eventTypeSelect.hidden = false;
        eventTypeSelect.disabled = false;
        eventTypeSelect.value = eventTitle;
      }
    }

    if (eventTypeText) {
      eventTypeText.hidden = false;
      eventTypeText.value = eventTitle;
    }

    if (additionalServicesSection) {
      additionalServicesSection.style.display = "none";
    }

    if (totalPriceSection) {
      totalPriceSection.style.display = "block";
    }

    const eventPrices = {
      "Founders Live Cairo": 200,
      "Investors Founders Meetup": 150,
      "Women Party 2026": 250,
      "AI Party Egypt": 300
    };

    if (totalPrice) {
      totalPrice.textContent = eventPrices[eventTitle] || 100;
    }
  }
});

// Profile page script
document.addEventListener("DOMContentLoaded", function () {
  var role = new URLSearchParams(window.location.search).get("role");
  var isOrganizer = (role || "").toLowerCase() === "organizer";
  var clientView = document.getElementById("client-profile-view");
  var organizerView = document.getElementById("organizer-profile-view");

  if (!clientView || !organizerView) {
    return;
  }

  clientView.hidden = isOrganizer;
  organizerView.hidden = !isOrganizer;
  document.title = isOrganizer ? "EventPro - Organizer Profile" : "EventPro - Profile";
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".auth-form") || document.querySelector("form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "modather@gmail.com" && password === "Mody1234") {
      window.location.href = "admin-index.html";
    } 
     else if (email === "client@gmail.com" && password === "Mody1234") {
      window.location.href = "client-index.html";
    } 
     else if (email === "organizer@gmail.com" && password === "Mody1234") {
      window.location.href = "organizer-index.html";
    } 
    else {
      alert("Invalid  email or password.");
    }
  });
});