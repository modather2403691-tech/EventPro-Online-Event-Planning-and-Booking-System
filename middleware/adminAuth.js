const { bootId } = require('./session');

module.exports = function requireAdmin(req, res, next) {
    const user = req.session && req.session.user;
    const role = user && user.role ? String(user.role).trim().toLowerCase() : '';
    const sessionBootId = user && user.sessionBootId ? String(user.sessionBootId) : '';

    if (!user || role !== 'admin' || sessionBootId !== bootId) {
        return res.redirect('/login');
    }

    return next();
};