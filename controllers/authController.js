const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.register = async (req, res) => {
    console.log("REGISTER CALLED");

    try {
        const { name, email, dob, password, phone, role } = req.body;

        const existingUser = await User.findOne({ email });

        console.log("existingUser =", existingUser);

        if (existingUser) {
            console.log("EMAIL EXISTS");

            return res.render('register', {
              error: "An account with this email already exists. Please sign in or use a different email."
            });
        }

        const finalRole =
            role && role.toLowerCase() === 'organizer'
                ? 'Organizer'
                : 'Client';

        const newUser = new User({
            name,
            email,
            dob,
            password: await bcrypt.hash(password, 10),
            phone,
            role: finalRole
        });

        await newUser.save();

        return res.redirect('/login');

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).send("Server Error");
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            email === "jana@eventpro.com" &&
            password === "Jana123#"
        ) {
            return res.redirect('/admin-index');
        }

        const user = await User.findOne({ email });
if (!user) {
    return res.render('login', {
        error: "No account found with this email."
    });
}

        const isMatch = await bcrypt.compare(password, user.password);

       if (!isMatch) {
    return res.render('login', {
        error: "Incorrect password. Please try again."
    });
}
        const dbRole = (user.role || '').trim().toLowerCase();

        if (dbRole === 'organizer') {
            return res.redirect('/organizer-index');
        }

        return res.redirect('/client-index');

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).send("Server Error!");
    }
};