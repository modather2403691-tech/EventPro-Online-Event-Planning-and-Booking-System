const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const eventController = require('../controllers/eventController');
const adminController = require('../controllers/adminController');
const Booking = require('../models/Booking');
const ContactMessage = require('../models/ContactMessage');

const BookingRequest = require('../models/BookingRequest');
const Event = require('../models/Event');
const requireAdmin = require('../middleware/adminAuth');
const { requireRole } = require('../middleware/roleAuth');

// Helper: get name from session or fallback
function userName(req, fallback) {
    const u = req.session && req.session.user;
    console.log('[route] session.user =', u);
    return (u && u.name) || fallback;
}

function roleFromSession(req) {
    const u = req.session && req.session.user;
    return (u && u.role ? String(u.role).trim().toLowerCase() : 'client');
}

function redirectByRole(req, res) {
    const role = roleFromSession(req);
    if (role === 'admin') return res.redirect('/admin-index');
    if (role === 'organizer') return res.redirect('/organizer-index');
    return res.redirect('/client-index');
}

// Generic pages (no session data needed)
const pages = [
    'about',
    'contact',
    'help-center',
    'package-details',
    'packages',
    'resources',
    'security'
];

router.get('/manage-users', requireAdmin, adminController.getManageUsers);
router.get('/admin-index', requireAdmin, adminController.getAdminIndex);
router.get('/admin-dashboard', requireAdmin, adminController.getAdminDashboard);
router.get('/admin-dashboard/export-csv', requireAdmin, adminController.exportReportsCsv);
router.get('/reports', requireAdmin, adminController.getReports);
router.get('/client-reservation', requireAdmin, adminController.getClientReservation);
router.get('/organizer-event', requireAdmin, adminController.getOrganizerEvent);

// Client pages that need session data
router.get('/client-dashboard', requireRole('client'), async (req, res) => {
    const u = (req.session && req.session.user) || {};
    if (roleFromSession(req) === 'admin') return res.redirect('/admin-index');
    if (roleFromSession(req) === 'organizer') return res.redirect('/organizer-index');
    if (!u.email) return res.redirect('/login');

    let bookings = [];
    try {
        bookings = await Booking.find({ userEmail: u.email }).sort({ createdAt: -1 });
    } catch (err) {
        console.error('CLIENT DASHBOARD ERROR:', err);
    }

    const total     = bookings.length;
    const pending   = bookings.filter(b => b.status === 'Pending');
    const confirmed = bookings.filter(b => b.status === 'Confirmed');
    const upcoming  = bookings.filter(b => {
        const d = b.eventDate;
        return d && new Date(d) >= new Date() && b.status !== 'Declined';
    });
    const completionRate = total > 0 ? Math.round((confirmed.length / total) * 100) : 0;

    res.render('client-dashboard', {
        name:  u.name  || 'Client',
        photo: u.photo || '',
        bookings,
        stats: {
            total,
            upcoming:  upcoming.length,
            completed: confirmed.length,
            pending:   pending.length,
            completionRate
        },
        pending,
        confirmed
    });
});

router.get('/my-bookings', requireRole('client'), async (req, res) => {
    const u = (req.session && req.session.user) || {};
    const userEmail = u.email || null;
    if (!userEmail) return res.redirect('/login');
    let bookings = [];

    try {
        bookings = await Booking.find({ userEmail }).sort({ createdAt: -1 });
    } catch (err) {
        console.error('MY BOOKINGS ERROR:', err);
    }

    res.render('my-bookings', {
        name:     u.name  || 'Client',
        photo:    u.photo || '',
        bookings
    });
});

// Booking form — must be logged in so the booking is tied to the account.
router.get('/book-event', requireRole('client'), (req, res) => {
    const u = req.session && req.session.user;
    if (!u || !u.email) return res.redirect('/login');
    (async () => {
        const eventId = req.query && req.query.eventId ? req.query.eventId : null;
        let event = null;
        if (eventId) {
            try { event = await Event.findById(eventId); } catch (e) { /* ignore bad id */ }
        }

        const price = req.query && req.query.price ? Number(req.query.price) : (event ? event.price : 0);
        const source = req.query && req.query.source ? req.query.source : '';

        return res.render('book-event', {
            name:  u.name  || '',
            email: u.email,
            phone: u.phone || '',
            event,
            price,
            source
        });
    })();
});

router.post('/book-event', requireRole('client'), async (req, res) => {
    const u = req.session && req.session.user;
    if (!u || !u.email) {
        return res.status(401).json({ error: 'Please log in to book an event.' });
    }

    const {
        name,
        phone,
        eventType,
        eventDate,
        guests,
        price,
        source,
        eventId
    } = req.body;

    if (!phone || !eventType) {
        return res.status(400).json({ error: 'Missing required booking fields.' });
    }

    try {
        // If this booking is for an organizer-created event, attach the event
        // and its organizer so it shows up in the organizer's management page.
        let linkedEvent = null;
        if (eventId) {
            try { linkedEvent = await Event.findById(eventId); } catch (e) { /* ignore bad id */ }
        }

        const booking = await new Booking({
            userName:  name || u.name,
            userEmail: u.email,            // always the logged-in account
            phone,
            eventType,
            eventDate: eventDate ? new Date(eventDate) : (linkedEvent ? linkedEvent.date : null),
            guests: guests ? Number(guests) : 0,
            price: price ? Number(price) : (linkedEvent ? linkedEvent.price : 0),
            source: source || 'unknown',
            status: 'Pending',
            eventId: linkedEvent ? linkedEvent._id : null,
            organizerEmail: linkedEvent ? linkedEvent.organizerEmail : '',
            organizerName:  linkedEvent ? linkedEvent.organizerName  : ''
        }).save();

        return res.json({ success: true, booking });
    } catch (err) {
        console.error('BOOK EVENT ERROR:', err);
        return res.status(500).json({ error: 'Unable to save booking.' });
    }
});

// Index pages — pass name from session
router.get('/organizer-index', requireRole('organizer'), async (req, res) => {
    const u = (req.session && req.session.user) || {};
    let events = [];
    try {
        events = await Event.find(u.email ? { organizerEmail: u.email } : {}).sort({ createdAt: -1 });
    } catch (err) {
        console.error('ORGANIZER INDEX EVENTS ERROR:', err);
    }
    res.render('organizer-index', { name: userName(req, 'Organizer'), events });
});

router.get('/client-index', requireRole('client'), async (req, res) => {
    const events = await eventController.getAllEvents();
    res.render('client-index', { name: userName(req, 'Client'), events });
});

// Profile pages
router.get('/client-profile', requireRole('client'), async (req, res) => {
    const u = (req.session && req.session.user) || {};
    const memberSince = u.memberSince
        ? new Date(u.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'N/A';

    let bookings = [];
    try {
        bookings = await Booking.find({ userEmail: u.email }).sort({ createdAt: -1 }).limit(4);
    } catch (err) {
        console.error('PROFILE BOOKINGS ERROR:', err);
    }

    res.render('client-profile', {
        name:        u.name  || 'Client',
        email:       u.email || 'N/A',
        phone:       u.phone || 'N/A',
        photo:       u.photo || '',
        memberSince,
        bookings
    });
});

// POST — update account active status
router.post('/client-profile/update-account', requireRole('client'), async (req, res) => {
    const u = req.session && req.session.user;
    if (!u) return res.status(401).json({ error: 'Not logged in' });
    const { active } = req.body;
    try {
        const User = require('../models/user');
        await User.findOneAndUpdate({ email: u.email }, { active: !!active });
        res.json({ success: true });
    } catch (err) {
        console.error('UPDATE ACCOUNT STATUS ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST — delete account (shared)
router.post('/profile/delete-account', async (req, res) => {
    const u = req.session && req.session.user;
    if (!u) return res.status(401).json({ error: 'Not logged in' });
    try {
        const { currentPassword } = req.body;
        if (!currentPassword) return res.status(400).json({ error: 'Current password required' });

        const bcrypt = require('bcryptjs');
        const User           = require('../models/user');
        const Booking        = require('../models/Booking');
        const BookingRequest = require('../models/BookingRequest');
        const Event          = require('../models/Event');

        const email = u.email;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const match = await bcrypt.compare(String(currentPassword), user.password);
        if (!match) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        await Promise.all([
            User.findOneAndDelete({ email }),
            Booking.deleteMany({ $or: [ { userEmail: email }, { organizerEmail: email } ] }),
            BookingRequest.deleteMany({ $or: [ { clientEmail: email }, { 'offers.organizerEmail': email } ] }),
            Event.deleteMany({ organizerEmail: email })
        ]);

        // Remove any organizer offers or accepted organizer references from remaining requests
        await BookingRequest.updateMany(
            { $or: [ { 'offers.organizerEmail': email }, { acceptedOrganizerEmail: email } ] },
            {
                $pull: { offers: { organizerEmail: email } },
                $set: { acceptedOrganizerEmail: '' }
            }
        );

        // Destroy session and clear cookie
        const sid = req.sessionId;
        const { store } = require('../middleware/session');
        if (sid && store[sid]) delete store[sid];
        res.clearCookie('sid', { path: '/' });

        res.json({ success: true });
    } catch (err) {
        console.error('DELETE ACCOUNT ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST — update profile info (name + phone)
router.post('/client-profile/update-info', requireRole('client'), async (req, res) => {
    const u = req.session && req.session.user;
    if (!u) return res.status(401).json({ error: 'Not logged in' });

    const { name, phone } = req.body;
    if (!name || name.trim().length < 9)        return res.status(400).json({ error: 'Name must be at least 9 characters' });
    if (!phone || !/^\d{11}$/.test(phone.trim())) return res.status(400).json({ error: 'Phone must be exactly 11 digits' });

    try {
        const User = require('../models/user');
        await User.findOneAndUpdate(
            { email: u.email },
            { name: name.trim(), phone: phone.trim() }
        );
        // Update session immediately
        req.session.user.name  = name.trim();
        req.session.user.phone = phone.trim();
        res.json({ success: true });
    } catch (err) {
        console.error('UPDATE INFO ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST — update profile photo
router.post('/client-profile/update-photo', requireRole('client'), async (req, res) => {
    const u = req.session && req.session.user;
    console.log('[DEBUG] /client-profile/update-photo headers.cookie=', req.headers && req.headers.cookie);
    console.log('[DEBUG] /client-profile/update-photo req.session.user=', u);
    if (!u) return res.status(401).json({ error: 'Not logged in' });

    const { photo } = req.body; // base64 data URL from client
    if (!photo) return res.status(400).json({ error: 'No photo provided' });

    // Validate it's an image data URL
    if (!photo.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid image format' });
    }

    try {
        const User = require('../models/user');
        await User.findOneAndUpdate({ email: u.email }, { photo });

        // Update session too so it reflects immediately
        req.session.user.photo = photo;

        res.json({ success: true, photo });
    } catch (err) {
        console.error('PHOTO UPDATE ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST — update organizer profile photo (same as client endpoint but for organizers)
router.post('/organizer-profile/update-photo', requireRole('organizer'), async (req, res) => {
    const u = req.session && req.session.user;
    console.log('[DEBUG] /organizer-profile/update-photo headers.cookie=', req.headers && req.headers.cookie);
    console.log('[DEBUG] /organizer-profile/update-photo req.session.user=', u);
    if (!u) return res.status(401).json({ error: 'Not logged in' });

    const { photo } = req.body; // base64 data URL from client
    if (!photo) return res.status(400).json({ error: 'No photo provided' });

    if (!photo.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid image format' });
    }

    try {
        const User = require('../models/user');
        await User.findOneAndUpdate({ email: u.email }, { photo });
        req.session.user.photo = photo;
        res.json({ success: true, photo });
    } catch (err) {
        console.error('ORGANIZER PHOTO UPDATE ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST — change password (shared)
router.post('/profile/change-password', async (req, res) => {
    try {
        const u = req.session && req.session.user;
        if (!u) return res.status(401).json({ error: 'Not logged in' });

        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmPassword) return res.status(400).json({ error: 'All fields required' });
        if (String(newPassword).length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
        if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });

        const bcrypt = require('bcryptjs');
        const User = require('../models/User');
        const user = await User.findOne({ email: u.email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const match = await bcrypt.compare(String(currentPassword), user.password);
        if (!match) return res.status(400).json({ error: 'Incorrect current password' });

        user.password = await bcrypt.hash(String(newPassword), 10);
        await user.save();

        res.json({ success: true });
    } catch (err) {
        console.error('CHANGE PASSWORD ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/organizer-dashboard', requireRole('organizer'), async (req, res) => {
    const u = (req.session && req.session.user) || {};
    if (!u.email) return res.redirect('/login');

    let totalEvents = 0;
    let totalRequested = 0;
    let recentBookings = [];

    try {
        totalEvents = await Event.countDocuments({ organizerEmail: u.email });
        totalRequested = await BookingRequest.countDocuments({ acceptedOrganizerEmail: u.email });
        recentBookings = await Booking.find({ organizerEmail: u.email })
            .sort({ createdAt: -1 })
            .limit(8);
    } catch (err) {
        console.error('ORGANIZER DASHBOARD ERROR:', err);
    }

    res.render('organizer-dashboard', {
        name: u.name || 'Organizer',
        photo: u.photo || '',
        totalEvents,
        totalRequested,
        recentBookings
    });
});

router.get('/organizer-profile', requireRole('organizer'), async (req, res) => {
    const u = (req.session && req.session.user) || {};
    if (!u.email) return res.redirect('/login');

    const memberSince = u.memberSince
        ? new Date(u.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'N/A';

    let events = [];
    let bookings = [];
    let stats = {
        totalEvents: 0,
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0
    };

    try {
        events = await Event.find({ organizerEmail: u.email }).sort({ createdAt: -1 }).limit(4);
        bookings = await Booking.find({ organizerEmail: u.email }).sort({ createdAt: -1 }).limit(4);
        stats.totalEvents = await Event.countDocuments({ organizerEmail: u.email });
        stats.totalBookings = await Booking.countDocuments({ organizerEmail: u.email });
        stats.pendingBookings = await Booking.countDocuments({ organizerEmail: u.email, status: 'Pending' });
        stats.confirmedBookings = await Booking.countDocuments({ organizerEmail: u.email, status: 'Confirmed' });
    } catch (err) {
        console.error('ORGANIZER PROFILE ERROR:', err);
    }

    res.render('organizer-profile', {
        name: u.name || 'Organizer',
        email: u.email || 'N/A',
        phone: u.phone || 'N/A',
        photo: u.photo || '',
        memberSince,
        events,
        bookings,
        stats
    });
});

router.get('/', async (req, res) => {
    if (roleFromSession(req) === 'admin' || roleFromSession(req) === 'organizer') {
        return redirectByRole(req, res);
    }

    const events = await eventController.getAllEvents();
    res.render('index', { events });
});

// ---- Events (organizer) ----
router.get('/addevent', requireRole('organizer'), eventController.showAddEvent);
router.post('/addevent', requireRole('organizer'), eventController.createEvent);
router.get('/manage-events', requireRole('organizer'), eventController.manageEvents);
router.post('/manage-events/delete', requireRole('organizer'), eventController.deleteEvent);
router.post('/manage-events/edit', requireRole('organizer'), eventController.editEvent);
router.post('/manage-events/booking-status', requireRole('organizer'), eventController.updateBookingStatus);

// ---- Booking requests (marketplace) ----
router.get('/new-request', requireRole('client'), eventController.showNewRequest);
router.post('/booking-requests/create', requireRole('client'), eventController.createRequest);
router.get('/booking-requests', requireRole('organizer'), eventController.organizerRequests);
router.get('/accepted-requests', requireRole('organizer'), eventController.acceptedRequests);
router.post('/booking-requests/offer', requireRole('organizer'), eventController.makeOffer);
router.get('/my-requests', requireRole('client'), eventController.clientRequests);
router.post('/booking-requests/accept', requireRole('client'), eventController.acceptOffer);
router.post('/booking-requests/cancel', requireRole('client'), eventController.cancelRequest);

pages.forEach((page) => {
    router.get(`/${page}`, (req, res) => {
        res.render(page);
    });
});

router.get('/register', (req, res) => {
    res.render('register', { error: null });
});


router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Logout
router.get('/logout', authController.logout);

// POST rout
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin/users/edit', adminController.editUser);
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { error: null });
});

router.post('/forgot-password', authController.forgotPassword);

router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        await ContactMessage.create({
            name,
            email,
            message
        });

        res.render('contact', {
            success: 'Message sent successfully'
        });

    } catch (err) {
        console.error(err);

        res.render('contact', {
            error: 'Failed to send message'
        });
    }
});

module.exports = router;
