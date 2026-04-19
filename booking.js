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
      
      const bookUrl = `book-event.html?source=event&event=${encodeURIComponent(eventName)}&price=${price}`;
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
        alert('Booking submitted successfully! 🎉');
        bookingForm.reset();
        // إخفاء السعر لو كان ظاهر
        const priceSection = document.getElementById('priceDisplaySection');
        if (priceSection) priceSection.style.display = 'none';
      }
    });
  }
});