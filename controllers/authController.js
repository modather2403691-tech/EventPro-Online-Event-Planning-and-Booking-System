const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const { store, persist } = require('../middleware/session');

exports.forgotPassword = async (req, res) => {
    console.log("BODY:", req.body);

    const email = req.body.email?.trim().toLowerCase();
    const newPassword = req.body.newPassword;

    const user = await User.findOne({ email });

    console.log("FOUND USER:", user);

    if (!user) {
        return res.render('forgot-password', {
            error: 'Email not found'
        });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.redirect('/login');
};
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
            persist();
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
        persist();

        const dbRole = user.role.trim().toLowerCase();
        if (dbRole === 'admin') {
            return res.redirect('/admin-index');
        }

        return res.redirect(dbRole === 'organizer' ? '/organizer-index' : '/client-index');

    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).send('Server Error!');
    }
};
exports.forgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.render('forgot-password', {
                error: 'Email not found'
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.redirect('/login');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
exports.logout = (req, res) => {
    const sid = req.sessionId;
    if (sid && store[sid]) delete store[sid];
    persist();
    res.clearCookie('sid', { path: '/' });
    res.redirect('/');
};
exports.sendMessage = async (req, res) => {
  const { name, email, message } = req.body;

  // هنا الإيميل يروح Gmail
};