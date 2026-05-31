const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Helper: get name from session or fallback
function userName(req, fallback) {
    const u = req.session && req.session.user;
    console.log('[route] session.user =', u);
    return (u && u.name) || fallback;
}

// Generic pages (no session data needed)
const pages = [
    'about',
    'addevent',
    'admin-dashboard',
    'availability',
    'book-event',
    'booking-requests',
    'client-reservation',
    'contact',
    'help-center',
    'index',
    'manage-users',
    'organizer-dashboard',
    'organizer-event',
    'package-details',
    'packages',
    'reports',
    'resources',
    'security'
];

// Client pages that need session data
router.get('/client-dashboard', (req, res) => {
    const u = (req.session && req.session.user) || {};
    res.render('client-dashboard', {
        name:  u.name  || 'Client',
        photo: u.photo || ''
    });
});

router.get('/my-bookings', (req, res) => {
    const u = (req.session && req.session.user) || {};
    res.render('my-bookings', {
        name:  u.name  || 'Client',
        photo: u.photo || ''
    });
});

// Index pages — pass name from session
router.get('/admin-index', (req, res) => {
    res.render('admin-index', { name: userName(req, 'Admin') });
});

router.get('/organizer-index', (req, res) => {
    res.render('organizer-index', { name: userName(req, 'Organizer') });
});

router.get('/client-index', (req, res) => {
    res.render('client-index', { name: userName(req, 'Client') });
});

// Profile pages
router.get('/client-profile', (req, res) => {
    const u = (req.session && req.session.user) || {};
    const memberSince = u.memberSince
        ? new Date(u.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'N/A';
    res.render('client-profile', {
        name:        u.name  || 'Client',
        email:       u.email || 'N/A',
        phone:       u.phone || 'N/A',
        photo:       u.photo || '',
        memberSince
    });
});

// POST — update profile photo
router.post('/client-profile/update-photo', async (req, res) => {
    const u = req.session && req.session.user;
    if (!u) return res.status(401).json({ error: 'Not logged in' });

    const { photo } = req.body; // base64 data URL from client
    if (!photo) return res.status(400).json({ error: 'No photo provided' });

    // Validate it's an image data URL
    if (!photo.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid image format' });
    }

    try {
        const User = require('../models/User');
        await User.findOneAndUpdate({ email: u.email }, { photo });

        // Update session too so it reflects immediately
        req.session.user.photo = photo;

        res.json({ success: true, photo });
    } catch (err) {
        console.error('PHOTO UPDATE ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/organizer-profile', (req, res) => {
    res.render('organizer-profile', { name: userName(req, 'Organizer') });
});

router.get('/', (req, res) => {
    res.render('index');
});

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

// POST routes
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
