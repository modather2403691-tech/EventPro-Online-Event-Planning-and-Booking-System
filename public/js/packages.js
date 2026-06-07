// Ahmed Fares - Event pricing data
const eventPrices = {
  "Founders Live Cairo": 150,
  "Investors Founders Meetup": 250,
  "Women Party 2026": 200,
  "AI Party Egypt": 300
};

// Ahmed Fares - Handle Join Event button clicks
document.addEventListener("DOMContentLoaded", function() {
  const joinButtons = document.querySelectorAll(".event-card button");
  
  joinButtons.forEach(button => {
    button.addEventListener("click", function(e) {
      const eventCard = button.closest(".event-card");
      const eventName = eventCard.querySelector("h3").textContent;
      const price = eventPrices[eventName] || 0;
      
      const bookUrl = `/book-event?source=event&event=${encodeURIComponent(eventName)}&price=${price}`;
      window.location.href = bookUrl;
    });
  });
  
  // Ahmed Fares - Hide Additional Notes field when coming from Join Event
  const urlParams = new URLSearchParams(window.location.search);
  const source = urlParams.get("source");
  const eventName = urlParams.get("event");
  const price = urlParams.get("price");
  
  if (source === "event") {
    const notesLabel = document.querySelector('label[for="notes"]');
    const notesTextarea = document.getElementById("notes");
    const notesDiv = notesLabel ? notesLabel.parentElement : null;
    
    if (notesDiv) notesDiv.style.display = "none";

    const eventTypeInput = document.getElementById("eventType");
    const eventDateSection = document.getElementById("eventDateSection");
    const priceDisplaySection = document.getElementById("priceDisplaySection");
    const eventDisplayPrice = document.getElementById("eventDisplayPrice");

    if (eventTypeInput && eventName) {
      eventTypeInput.value = eventName;
    }

    if (eventDateSection) {
      eventDateSection.style.display = "none";
    }

    if (priceDisplaySection && eventDisplayPrice) {
      priceDisplaySection.style.display = "block";
      eventDisplayPrice.textContent = price || eventPrices[eventName] || "0";
    }
  }
});
//ahmed Fares
function setupPriceCalculation(basePrice) {
  const totalPrice = document.getElementById("totalPrice");
  const services = document.querySelectorAll(".service");

  if (!totalPrice) return;

  services.forEach(service => {
    service.addEventListener("change", () => {
      let total = basePrice;

      services.forEach(item => {
        if (item.checked) {
          total += parseInt(item.value);
        }
      });

      totalPrice.textContent = total;
    });
  });
}

//validation 
document.addEventListener("DOMContentLoaded", function () {
  const bookingForm = document.getElementById('bookingForm');

  // --- 1. منع الحروف والأرقام السالبة "لحظياً" في الموبايل والضيوف ---
  const numericFields = ['phone', 'guests'];
  numericFields.forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener('keypress', (e) => {
        if (e.which < 48 || e.which > 57) e.preventDefault();
      });
      field.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
      });
    }
  });

  // --- 2. التحقق عند إرسال الفورم (Submit) ---
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let isValid = true;

      // مسح رسايل الخطأ القديمة
      document.querySelectorAll('.error').forEach(span => span.textContent = '');

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const eventDate = document.getElementById('eventDate').value;
      const guestsInput = document.getElementById('guests');
      const guestsSection = document.getElementById('guestsSection');
      const isEventSource = new URLSearchParams(window.location.search).get('source') === 'event';

      // ✅ الـ Name (مطلوب + 9 حروف)
      if (name === '') {
        document.getElementById('nameError').textContent = 'Full Name is required.';
        isValid = false;
      } else if (name.length < 9) {
        document.getElementById('nameError').textContent = 'Name must be at least 9 characters.';
        isValid = false;
      }

      // ✅ الـ Email (مطلوب + صيغة صحيحة)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email === '') {
        document.getElementById('emailError').textContent = 'Email is required.';
        isValid = false;
      } else if (!emailRegex.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email.';
        isValid = false;
      }

      // ✅ الـ Phone (مطلوب + 11 رقم)
      if (phone === '') {
        document.getElementById('phoneError').textContent = 'Phone number is required.';
        isValid = false;
      } else if (phone.length < 11) {
        document.getElementById('phoneError').textContent = 'Must be at least 11 digits.';
        isValid = false;
      }

      // ✅ الـ Date (مطلوب + مش في الماضي)
      if (!isEventSource) {
        if (eventDate === '') {
          document.getElementById('dateError').textContent = 'Event date is required.';
          isValid = false;
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (new Date(eventDate) < today) {
            document.getElementById('dateError').textContent = 'Date cannot be in the past.';
            isValid = false;
          }
        }
      }

      // ✅ الـ Guests (مطلوب لو القسم ظاهر)
      if (guestsSection && window.getComputedStyle(guestsSection).display !== 'none') {
        const guests = guestsInput.value.trim();
        if (guests === '') {
          document.getElementById('guestsError').textContent = 'Number of guests is required.';
          isValid = false;
        } else if (parseInt(guests) <= 0) {
          document.getElementById('guestsError').textContent = 'Must be at least 1 guest.';
          isValid = false;
        }
      }

      // لو كله تمام
      if (isValid) {
        const sourceInput = document.getElementById('source');
        const priceInput = document.getElementById('price');
        const eventIdInput = document.getElementById('eventId');
        const eventTypeInput = document.getElementById('eventType');

        const body = {
          name,
          email,
          phone,
          eventType: eventTypeInput ? eventTypeInput.value.trim() : '',
          eventDate,
          guests: guestsInput ? guestsInput.value.trim() : '',
          price: priceInput ? priceInput.value : 0,
          source: sourceInput ? sourceInput.value : 'unknown',
          eventId: eventIdInput ? eventIdInput.value : ''
        };

        fetch('/book-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
          .then(async response => {
            const data = await response.json();
            if (response.status === 401) {
              alert('Please log in to book an event.');
              window.location.href = '/login';
              return;
            }
            if (!response.ok) {
              throw new Error(data.error || 'Booking failed.');
            }
            alert('Booking submitted successfully! 🎉');
            bookingForm.reset();
            const priceSection = document.getElementById('priceDisplaySection');
            if (priceSection) priceSection.style.display = 'none';
            window.location.href = '/my-bookings';
          })
          .catch(error => {
            console.error('Booking submit error:', error);
            alert('Unable to save booking. Please try again.');
          });
      }
    });
  }
});

/*book event*/
  const guestsSection = document.getElementById("guestsSection");
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const source = params.get("source");
  const type = params.get("type");
  const event = params.get("event");
  const price = params.get("price");

  const sourceInput = document.getElementById('source');
  const priceInput = document.getElementById('price');
  const eventIdInput = document.getElementById('eventId');
  if (sourceInput) sourceInput.value = source || 'unknown';
  if (priceInput) priceInput.value = price || '0';
  if (eventIdInput) eventIdInput.value = params.get('eventId') || '';

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
    video: "/images/wedding.mp4"
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
    video: "/images/birthday.mp4"
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
    video: "/images/party.mp4"
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
      window.location.href = `/new-request?type=${encodeURIComponent(type)}`;
    };
  }
});
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
  });

  document.addEventListener("keyup", () => {
  const searchValue = document.getElementById("packageSearch").value.toLowerCase();
  const cards = document.querySelectorAll(".package-card");

  cards.forEach(card => {
    const title = card.querySelector("h2").innerText.toLowerCase();
    const description = card.querySelector("p").innerText.toLowerCase();

    if (title.includes(searchValue) || description.includes(searchValue)) {
      card.style.display = "block"; // أظهر الكارت لو مطابق للبحث
    } else {
      card.style.display = "none";  // اخفي الكارت لو مش مطابق
    }
  });
});



document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("packageSearch");
    const priceFilter = document.getElementById("priceFilter");
    const wrapper = document.querySelector(".packages-wrapper");

    // إنشاء رسالة "لا يوجد نتائج" وإخفائها في الأول
    const noResultsMsg = document.createElement("p");
    noResultsMsg.id = "noResults";
    noResultsMsg.innerText = "No packages found matching your criteria.";
    noResultsMsg.style.cssText = "display:none; text-align:center; width:100%; font-size:1.2rem; margin-top:20px;";
    wrapper.appendChild(noResultsMsg);

    function filterPackages() {
        const searchValue = searchInput.value.toLowerCase();
        const priceValue = priceFilter.value;
        const cards = document.querySelectorAll(".package-card");
        let foundAny = false;

        cards.forEach(card => {
            const title = card.querySelector("h2").innerText.toLowerCase();
            const priceText = card.querySelector(".price").innerText;
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));

            let matchesSearch = title.includes(searchValue);
            let matchesPrice = true;

            if (priceValue === "cheap") matchesPrice = price < 500;
            if (priceValue === "expensive") matchesPrice = price >= 500;

            if (matchesSearch && matchesPrice) {
                card.style.display = "block";
                foundAny = true;
            } else {
                card.style.display = "none";
            }
        });

        // إظهار أو إخفاء رسالة "No Results"
        noResultsMsg.style.display = foundAny ? "none" : "block";
    }

    searchInput.addEventListener("keyup", filterPackages);
    priceFilter.addEventListener("change", filterPackages);
});