const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Booking = require('../models/Booking');
const BookingRequest = require('../models/BookingRequest');
const Event = require('../models/Event');
const ContactMessage = require('../models/ContactMessage');

function sessionUser(req) {
    return (req.session && req.session.user) || {};
}

function monthName(monthIndex) {
    return new Date(2000, monthIndex, 1).toLocaleString('en-US', { month: 'long' });
}

async function buildRecentActivity() {
    const [users, bookings, requests, events] = await Promise.all([
        User.find({}).sort({ _id: -1 }).limit(5),
        Booking.find({}).sort({ createdAt: -1 }).limit(5),
        BookingRequest.find({}).sort({ createdAt: -1 }).limit(5),
        Event.find({}).sort({ createdAt: -1 }).limit(5)
    ]);

    const activity = [];

    users.forEach(user => {
        activity.push({
            activityId: `USR-${String(user._id).slice(-6).toUpperCase()}`,
            user: user.name || user.email || 'User',
            role: user.role || 'Client',
            action: 'Profile updated or created',
            date: user._id.getTimestamp()
        });
    });

    bookings.forEach(booking => {
        activity.push({
            activityId: `BKG-${String(booking._id).slice(-6).toUpperCase()}`,
            user: booking.userName || booking.userEmail || 'Booking',
            role: 'Client',
            action: `Booking ${booking.status || 'Pending'}`,
            date: booking.createdAt || booking._id.getTimestamp()
        });
    });

    requests.forEach(request => {
        activity.push({
            activityId: `REQ-${String(request._id).slice(-6).toUpperCase()}`,
            user: request.clientName || request.clientEmail || 'Request',
            role: 'Client',
            action: `Request ${request.status || 'Open'}`,
            date: request.createdAt || request._id.getTimestamp()
        });
    });

    events.forEach(event => {
        activity.push({
            activityId: `EVT-${String(event._id).slice(-6).toUpperCase()}`,
            user: event.organizerName || 'Organizer',
            role: 'Organizer',
            action: `Created event ${event.title || ''}`.trim(),
            date: event.createdAt || event._id.getTimestamp()
        });
    });

    return activity
        .sort((left, right) => new Date(right.date) - new Date(left.date))
        .slice(0, 12)
        .map(item => ({
            ...item,
            dateLabel: new Date(item.date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
        }));
}

async function buildReportRows() {
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const rows = await Booking.aggregate([
        {
            $match: {
                createdAt: { $gte: start }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                totalBookings: { $sum: 1 },
                completed: {
                    $sum: {
                        $cond: [{ $in: ['$status', ['Confirmed', 'CheckedIn']] }, 1, 0]
                    }
                },
                pending: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0]
                    }
                },
                revenue: { $sum: '$price' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return rows.map(row => ({
        month: monthName(row._id.month - 1),
        totalBookings: row.totalBookings,
        completed: row.completed,
        pending: row.pending,
        revenue: row.revenue
    }));
}

function toCsv(rows) {
    const header = ['Month', 'Total Bookings', 'Completed', 'Pending', 'Revenue'];
    const escapeCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const lines = [header.map(escapeCell).join(',')];

    rows.forEach(row => {
        lines.push([
            row.month,
            row.totalBookings,
            row.completed,
            row.pending,
            row.revenue
        ].map(escapeCell).join(','));
    });

    return lines.join('\n');
}

async function buildOrganizerTopLists() {
    const [acceptedPackages, createdEvents] = await Promise.all([
        Booking.aggregate([
            {
                $match: {
                    status: { $in: ['Confirmed', 'CheckedIn'] }
                }
            },
            {
                $group: {
                    _id: '$organizerEmail',
                    organizer: { $first: '$organizerName' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 4 }
        ]),
        Event.aggregate([
            {
                $group: {
                    _id: '$organizerEmail',
                    organizer: { $first: '$organizerName' },
                    count: { $sum: 1 },
                    latestAddedEventDate: { $max: '$createdAt' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 4 }
        ])
    ]);

    return {
        acceptedPackages: acceptedPackages.map((item, index) => ({
            rank: index + 1,
            organizer: item.organizer || 'Organizer',
            acceptedPackages: item.count,
            acceptanceRate: Math.min(100, 80 + (item.count * 2))
        })),
        createdEvents: createdEvents.map((item, index) => ({
            rank: index + 1,
            organizer: item.organizer || 'Organizer',
            eventsAdded: item.count,
            latestAddedEventDate: item.latestAddedEventDate ? new Date(item.latestAddedEventDate).toLocaleDateString('en-CA') : 'N/A'
        }))
    };
}

exports.getManageUsers = async (req, res) => {
    console.log('ADMIN:getManageUsers called —', req.method, req.originalUrl);
    try {
        const users = await User.find({}).sort({ _id: -1 });
        return res.render('manage-users', { users });
    } catch (err) {
        console.error('ADMIN:getManageUsers ERROR:', err);
        return res.render('manage-users', { users: [] });
    }
};

exports.getAdminIndex = async (req, res) => {
    const user = sessionUser(req);

    try {
        const [totalUsers, totalBookings, totalEvents, pendingRequests] = await Promise.all([
            User.countDocuments({}),
            Booking.countDocuments({}),
            Event.countDocuments({}),
            BookingRequest.countDocuments({ status: 'Open' })
        ]);

        return res.render('admin-index', {
            name: user.name || 'Admin',
            metrics: {
                totalUsers,
                totalBookings,
                totalEvents,
                pendingRequests
            }
        });
    } catch (err) {
        console.error('ADMIN:getAdminIndex ERROR:', err);
        return res.render('admin-index', {
            name: user.name || 'Admin',
            metrics: {
                totalUsers: 0,
                totalBookings: 0,
                totalEvents: 0,
                pendingRequests: 0
            }
        });
    }
};

exports.getAdminDashboard = async (req, res) => {
    const user = sessionUser(req);

    try {
        const [activeUsers, newBookings, pendingApprovals, activity] = await Promise.all([
            User.countDocuments({ status: 'Active' }),
            Booking.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
            BookingRequest.countDocuments({ status: 'Open' }),
            buildRecentActivity()
        ]);

        return res.render('admin-dashboard', {
            name: user.name || 'Admin',
            stats: {
                activeUsers,
                newBookings,
                pendingApprovals
            },
            activity,
            updatedAt: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            })
        });
    } catch (err) {
        console.error('ADMIN:getAdminDashboard ERROR:', err);
        return res.render('admin-dashboard', {
            name: user.name || 'Admin',
            stats: { activeUsers: 0, newBookings: 0, pendingApprovals: 0 },
            activity: [],
            updatedAt: new Date().toLocaleString('en-US')
        });
    }
};

exports.getReports = async (req, res) => {
    const user = sessionUser(req);

    try {
        const [reportRows, totalBookings, completedEvents, revenue] = await Promise.all([
            buildReportRows(),
            Booking.countDocuments({}),
            Booking.countDocuments({ status: { $in: ['Confirmed', 'CheckedIn'] } }),
            Booking.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$price' } } }])
        ]);

        const totalRevenue = (revenue[0] && revenue[0].totalRevenue) || 0;

        return res.render('reports', {
            name: user.name || 'Admin',
            metrics: {
                monthlyBookings: reportRows.reduce((sum, row) => sum + row.totalBookings, 0),
                completedEvents,
                totalRevenue,
                totalBookings
            },
            reportRows
        });
    } catch (err) {
        console.error('ADMIN:getReports ERROR:', err);
        return res.render('reports', {
            name: user.name || 'Admin',
            metrics: { monthlyBookings: 0, completedEvents: 0, totalRevenue: 0, totalBookings: 0 },
            reportRows: []
        });
    }
};

exports.exportReportsCsv = async (req, res) => {
    try {
        const reportRows = await buildReportRows();
        const csv = toCsv(reportRows);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="eventpro-reports.csv"');
        return res.send(csv);
    } catch (err) {
        console.error('ADMIN:exportReportsCsv ERROR:', err);
        return res.status(500).send('Unable to export report CSV.');
    }
};

exports.getClientReservation = async (req, res) => {
    const user = sessionUser(req);

    try {
        const [requests, joinedEvents] = await Promise.all([
            BookingRequest.find({}).sort({ createdAt: -1 }).limit(12),
            Booking.find({ source: 'request' }).sort({ createdAt: -1 }).limit(12)
        ]);

        return res.render('client-reservation', {
            name: user.name || 'Admin',
            requests,
            joinedEvents
        });
    } catch (err) {
        console.error('ADMIN:getClientReservation ERROR:', err);
        return res.render('client-reservation', {
            name: user.name || 'Admin',
            requests: [],
            joinedEvents: []
        });
    }
};

exports.getOrganizerEvent = async (req, res) => {
    const user = sessionUser(req);

    try {
        const [events, organizerLists] = await Promise.all([
            Event.find({}).sort({ createdAt: -1 }),
            buildOrganizerTopLists()
        ]);

        return res.render('organizer-event', {
            name: user.name || 'Admin',
            events,
            acceptedPackages: organizerLists.acceptedPackages,
            createdEvents: organizerLists.createdEvents
        });
    } catch (err) {
        console.error('ADMIN:getOrganizerEvent ERROR:', err);
        return res.render('organizer-event', {
            name: user.name || 'Admin',
            events: [],
            acceptedPackages: [],
            createdEvents: []
        });
    }
};

exports.addUser = async (req, res) => {
    try {
        console.log('ADMIN:addUser called');
        console.log('ADMIN:addUser body:', req.body);
        const { name, email, password, phone, dob, role } = req.body;

        if (!name || !email || !password || !phone || !dob) {
            return res.status(400).send('Missing required fields');
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.redirect('/admin/users');
        }

        const hashed = await bcrypt.hash(password, 10);

        const normalizedRole = role && role.toLowerCase() === 'organizer'
            ? 'Organizer'
            : role && role.toLowerCase() === 'admin'
                ? 'Admin'
                : 'Client';

        const newUser = new User({
            name,
            email,
            dob: new Date(dob),
            password: hashed,
            phone,
            role: normalizedRole
        });

        await newUser.save();
        return res.redirect('/admin/users');
    } catch (err) {
        console.error('ADMIN:addUser ERROR:', err);
        return res.status(500).send('Server error');
    }
};

exports.editUser = async (req, res) => {
    try {
        console.log('ADMIN:editUser called —', req.method, req.originalUrl);
        console.log('ADMIN:editUser body:', req.body);
        const { _id, name, email, phone, dob, role, status } = req.body;
        if (!_id) return res.json({ success: false, message: 'Missing id' });

        const update = {};
        if (name) update.name = name;
        if (email) update.email = email;
        if (phone) update.phone = phone;
        if (dob) update.dob = new Date(dob);
        if (role) update.role = role;
        if (typeof status !== 'undefined') update.status = status;

        const user = await User.findByIdAndUpdate(_id, update, { new: true });
        if (!user) return res.json({ success: false, message: 'User not found' });
        return res.json({ success: true, user });
    } catch (err) {
        console.error('ADMIN:editUser ERROR:', err);
        return res.json({ success: false, message: 'Server error' });
    }
};
exports.getMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find()
            .sort({ createdAt: -1 });

        res.render('messages', { messages });

    } catch (err) {
        console.error(err);
        res.render('messages', { messages: [] });
    }
};