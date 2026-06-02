const Event = require('../models/Event');
const Booking = require('../models/Booking');
const BookingRequest = require('../models/BookingRequest');

// ---- helpers ---------------------------------------------------------------

function sessionUser(req) {
  return (req.session && req.session.user) || null;
}

// Load all events (newest first) — used to populate the home pages.
async function getAllEvents() {
  try {
    return await Event.find().sort({ createdAt: -1 });
  } catch (err) {
    console.error('LOAD EVENTS ERROR:', err);
    return [];
  }
}

// ---- events: create --------------------------------------------------------

// GET /addevent  (organizer)
function showAddEvent(req, res) {
  const u = sessionUser(req);
  res.render('addevent', { name: (u && u.name) || 'Organizer' });
}

// POST /addevent  (organizer) — expects JSON (base64 image)
async function createEvent(req, res) {
  const u = sessionUser(req);
  if (!u || u.role !== 'organizer') {
    return res.status(401).json({ error: 'Please log in as an organizer first.' });
  }

  const { title, image, date, capacity, location, rules, price, category } = req.body;

  if (!title || !date || !location) {
    return res.status(400).json({ error: 'Title, date and location are required.' });
  }

  try {
    const event = await new Event({
      title,
      image:    image || '',
      date:     date ? new Date(date) : null,
      capacity: capacity ? Number(capacity) : 0,
      location,
      rules:    rules || '',
      price:    price ? Number(price) : 0,
      category: category || 'party',
      organizerName:  u.name || 'Organizer',
      organizerEmail: u.email || ''
    }).save();

    return res.json({ success: true, event });
  } catch (err) {
    console.error('CREATE EVENT ERROR:', err);
    return res.status(500).json({ error: 'Unable to save event.' });
  }
}

// ---- events: organizer management -----------------------------------------

// GET /manage-events  (organizer) — the organizer's own events + who booked each
async function manageEvents(req, res) {
  const u = sessionUser(req);
  const email = (u && u.email) || null;
  if (!email) return res.redirect('/login');

  let events = [];
  let bookingsByEvent = {};

  try {
    events = await Event.find({ organizerEmail: email }).sort({ createdAt: -1 });
    const bookings = await Booking.find({ organizerEmail: email }).sort({ createdAt: -1 });
    bookings.forEach(b => {
      const key = b.eventId ? b.eventId.toString() : 'other';
      (bookingsByEvent[key] = bookingsByEvent[key] || []).push(b);
    });
  } catch (err) {
    console.error('MANAGE EVENTS ERROR:', err);
  }

  res.render('manage-events', {
    name: u.name || 'Organizer',
    events,
    bookingsByEvent
  });
}

// POST /manage-events/delete  (organizer)
async function deleteEvent(req, res) {
  const u = sessionUser(req);
  const email = (u && u.email) || null;
  const { eventId } = req.body;

  if (email && eventId) {
    try {
      await Event.deleteOne({ _id: eventId, organizerEmail: email });
    } catch (err) {
      console.error('DELETE EVENT ERROR:', err);
    }
  }
  res.redirect('/manage-events');
}

// POST /manage-events/edit  (organizer) — update an event's details
async function editEvent(req, res) {
  const u = sessionUser(req);
  const email = (u && u.email) || null;
  const { eventId, title, category, date, capacity, price, location, rules } = req.body;

  if (email && eventId && title) {
    try {
      await Event.updateOne(
        { _id: eventId, organizerEmail: email },
        {
          title,
          category: category || 'party',
          date: date ? new Date(date) : null,
          capacity: capacity ? Number(capacity) : 0,
          price: price ? Number(price) : 0,
          location: location || '',
          rules: rules || ''
        }
      );
    } catch (err) {
      console.error('EDIT EVENT ERROR:', err);
    }
  }
  res.redirect('/manage-events');
}

// POST /manage-events/booking-status  (organizer) — confirm/decline a booking on an event
async function updateBookingStatus(req, res) {
  const u = sessionUser(req);
  const email = (u && u.email) || null;
  const { bookingId, status } = req.body;
  const allowed = ['Pending', 'Confirmed', 'Declined', 'CheckedIn'];

  if (email && bookingId && allowed.includes(status)) {
    try {
      await Booking.updateOne({ _id: bookingId, organizerEmail: email }, { status });
    } catch (err) {
      console.error('BOOKING STATUS ERROR:', err);
    }
  }
  res.redirect('/manage-events');
}

// ---- booking requests: marketplace ----------------------------------------

// GET /new-request  (client) — form to broadcast a custom request
function showNewRequest(req, res) {
  const u = sessionUser(req);
  if (!u || !u.email) return res.redirect('/login');
  res.render('new-request', {
    name:  u.name  || 'Client',
    email: u.email,
    phone: u.phone || ''
  });
}

// POST /booking-requests/create  (client)
async function createRequest(req, res) {
  const u = sessionUser(req);
  if (!u || !u.email) return res.redirect('/login');

  const { name, phone, eventType, eventDate, guests, notes } = req.body;

  if (!phone || !eventType) {
    return res.status(400).send('Missing required request fields.');
  }

  try {
    await new BookingRequest({
      clientName:  name || u.name,
      clientEmail: u.email,            // always the logged-in account
      phone,
      eventType,
      eventDate: eventDate ? new Date(eventDate) : null,
      guests: guests ? Number(guests) : 0,
      notes: notes || '',
      status: 'Open'
    }).save();
    return res.redirect('/my-requests');
  } catch (err) {
    console.error('CREATE REQUEST ERROR:', err);
    return res.status(500).send('Unable to save request.');
  }
}

// GET /booking-requests  (organizer) — dashboard of ALL open requests
async function organizerRequests(req, res) {
  const u = sessionUser(req);
  const email = (u && u.email) || '';

  let requests = [];
  try {
    requests = await BookingRequest.find({ status: 'Open' }).sort({ createdAt: -1 });
  } catch (err) {
    console.error('ORGANIZER REQUESTS ERROR:', err);
  }

  res.render('booking-requests', {
    name: (u && u.name) || 'Organizer',
    organizerEmail: email,
    requests
  });
}

// POST /booking-requests/offer  (organizer) — reply to a request with a price
async function makeOffer(req, res) {
  const u = sessionUser(req);
  if (!u || u.role !== 'organizer') {
    return res.status(401).send('Please log in as an organizer first.');
  }

  const { requestId, price } = req.body;
  const priceNum = Number(price);

  if (!requestId || !priceNum || priceNum <= 0) {
    return res.redirect('/booking-requests');
  }

  try {
    const request = await BookingRequest.findById(requestId);
    if (request && request.status === 'Open') {
      // Replace this organizer's previous offer if they already made one.
      request.offers = request.offers.filter(o => o.organizerEmail !== u.email);
      request.offers.push({
        organizerName:  u.name || 'Organizer',
        organizerEmail: u.email,
        price: priceNum
      });
      await request.save();
    }
  } catch (err) {
    console.error('MAKE OFFER ERROR:', err);
  }
  res.redirect('/booking-requests');
}

// GET /my-requests  (client) — the client's own requests + offers received
async function clientRequests(req, res) {
  const u = sessionUser(req);
  const email = (u && u.email) || null;
  if (!email) return res.redirect('/login');

  let requests = [];
  try {
    requests = await BookingRequest.find({ clientEmail: email }).sort({ createdAt: -1 });
  } catch (err) {
    console.error('CLIENT REQUESTS ERROR:', err);
  }

  res.render('my-requests', {
    name: u.name || 'Client',
    requests
  });
}

// POST /booking-requests/accept  (client) — accept one organizer's offer
async function acceptOffer(req, res) {
  const u = sessionUser(req);
  const email = (u && u.email) || null;
  const { requestId, organizerEmail } = req.body;

  if (email && requestId && organizerEmail) {
    try {
      const request = await BookingRequest.findOne({ _id: requestId, clientEmail: email });
      if (request && request.status === 'Open') {
        const offer = request.offers.find(o => o.organizerEmail === organizerEmail);
        if (offer) {
          request.status = 'Confirmed';
          request.acceptedOrganizerName  = offer.organizerName;
          request.acceptedOrganizerEmail = offer.organizerEmail;
          request.acceptedPrice = offer.price;
          await request.save();

          // Mirror the confirmed request into the organizer's event bookings,
          // so it appears in their management view as well.
          await new Booking({
            userName:  request.clientName,
            userEmail: request.clientEmail,
            phone:     request.phone,
            eventType: request.eventType,
            eventDate: request.eventDate,
            guests:    request.guests,
            price:     offer.price,
            source:    'request',
            status:    'Confirmed',
            organizerEmail: offer.organizerEmail,
            organizerName:  offer.organizerName
          }).save();
        }
      }
    } catch (err) {
      console.error('ACCEPT OFFER ERROR:', err);
    }
  }
  res.redirect('/my-requests');
}

// POST /booking-requests/cancel  (client)
async function cancelRequest(req, res) {
  const u = sessionUser(req);
  const email = (u && u.email) || null;
  const { requestId } = req.body;

  if (email && requestId) {
    try {
      await BookingRequest.updateOne(
        { _id: requestId, clientEmail: email, status: 'Open' },
        { status: 'Cancelled' }
      );
    } catch (err) {
      console.error('CANCEL REQUEST ERROR:', err);
    }
  }
  res.redirect('/my-requests');
}

module.exports = {
  getAllEvents,
  showAddEvent,
  createEvent,
  manageEvents,
  deleteEvent,
  editEvent,
  updateBookingStatus,
  showNewRequest,
  createRequest,
  organizerRequests,
  makeOffer,
  clientRequests,
  acceptOffer,
  cancelRequest
};
