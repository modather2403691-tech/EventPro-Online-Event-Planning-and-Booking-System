const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const { store } = require('../middleware/session');

exports.register = async (req, res) => {
    try {
        const { name, email, dob, password, phone, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', {
                error: 'An account with this email already exists.'
            });
        }

        const finalRole = role && role.toLowerCase() === 'organizer' ? 'Organizer' : 'Client';

        await new User({
            name,
            email,
            dob,
            password: await bcrypt.hash(password, 10),
            phone,
            role: finalRole
        }).save();

        return res.redirect('/login');

    } catch (err) {
        console.error('REGISTER ERROR:', err);
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const sid = req.sessionId;

        // Admin hardcoded login
        if (email === 'jana@eventpro.com' && password === 'Jana123#') {
            store[sid].user = { name: 'Jana', role: 'admin' };
            console.log('[login] admin session saved:', store[sid]);
            return res.redirect('/admin-index');
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'No account found with this email.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Incorrect password. Please try again.' });
        }

        // Write directly into the store — no save() needed
        store[sid].user = {
            name:        user.name,
            email:       user.email,
            phone:       user.phone,
            photo:       user.photo || '',
            memberSince: user._id.getTimestamp(),
            role:        user.role.trim().toLowerCase()
        };
        console.log('[login] session saved for sid', sid.slice(0,8), ':', store[sid].user);

        const dbRole = user.role.trim().toLowerCase();
        return res.redirect(dbRole === 'organizer' ? '/organizer-index' : '/client-index');

    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).send('Server Error!');
    }
};

exports.logout = (req, res) => {
    const sid = req.sessionId;
    if (sid && store[sid]) delete store[sid];
    res.clearCookie('sid', { path: '/' });
    res.redirect('/');
};
