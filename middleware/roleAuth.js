const { bootId } = require('./session');

function normalizeRole(role) {
    return role ? String(role).trim().toLowerCase() : '';
}

function getUser(req) {
    return (req.session && req.session.user) || null;
}

function redirectToRoleHome(res, role) {
    if (role === 'admin') return res.redirect('/admin-index');
    if (role === 'organizer') return res.redirect('/organizer-index');
    return res.redirect('/client-index');
}

function requireRole(expectedRole) {
    const normalizedExpectedRole = normalizeRole(expectedRole);

    return (req, res, next) => {
        const user = getUser(req);
        const role = normalizeRole(user && user.role);
        const sessionBootId = user && user.sessionBootId ? String(user.sessionBootId) : '';

        if (!user || sessionBootId !== bootId) {
            return res.redirect('/login');
        }

        if (role !== normalizedExpectedRole) {
            return redirectToRoleHome(res, role);
        }

        return next();
    };
}

module.exports = {
    requireRole,
    redirectToRoleHome,
    normalizeRole,
};