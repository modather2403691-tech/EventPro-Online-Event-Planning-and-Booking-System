const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// In-memory store: { sid: { user: null, createdAt: timestamp } }
const store = {};
const COOKIE_NAME = 'sid';
const MAX_AGE_MS  = 1000 * 60 * 60 * 24 * 30; // 30 days of inactivity
const STORE_FILE  = process.env.SESSION_FILE || path.join(__dirname, '..', '.sessions.json');

// Load persisted sessions on boot so users stay logged in across server
// restarts (in-memory only would silently log everyone out on every restart).
try {
    if (fs.existsSync(STORE_FILE)) {
        Object.assign(store, JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')));
    }
} catch (err) {
    console.error('Session load failed:', err.message);
}

function persist() {
    try {
        fs.writeFileSync(STORE_FILE, JSON.stringify(store));
    } catch (err) {
        console.error('Session save failed:', err.message);
    }
}

// NOTE: we deliberately do NOT autosave on a short timer. Writing .sessions.json
// frequently makes file-watchers like nodemon restart the server (which logs
// everyone out). Logged-in state is saved immediately by the login/logout
// handlers via persist(); the hourly prune below is the only other writer.

// Prune expired sessions every hour
setInterval(() => {
    const now = Date.now();
    let changed = false;
    for (const id of Object.keys(store)) {
        if (now - store[id].createdAt > MAX_AGE_MS) { delete store[id]; changed = true; }
    }
    if (changed) persist();
}, 60 * 60 * 1000);

function randomId() {
    return crypto.randomBytes(32).toString('hex');
}

function parseCookies(header) {
    const out = {};
    for (const part of (header || '').split(';')) {
        const idx = part.indexOf('=');
        if (idx < 0) continue;
        const k = part.slice(0, idx).trim();
        const v = part.slice(idx + 1).trim();
        out[k] = decodeURIComponent(v);
    }
    return out;
}

function setCookie(req, res, sid) {
    // Use raw Set-Cookie header so it works before AND after redirect
    const parts = [
        `${COOKIE_NAME}=${sid}`,
        'Path=/',
        'HttpOnly',
        `Max-Age=${Math.floor(MAX_AGE_MS / 1000)}`,
        'SameSite=Lax'
    ];

    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    if (isSecure) parts.push('Secure');

    const cookie = parts.join('; ');
    const existing = res.getHeader('Set-Cookie');
    if (Array.isArray(existing)) {
        res.setHeader('Set-Cookie', [...existing, cookie]);
    } else if (existing) {
        res.setHeader('Set-Cookie', [existing, cookie]);
    } else {
        res.setHeader('Set-Cookie', cookie);
    }
}

module.exports = function sessionMiddleware(req, res, next) {
    const cookies = parseCookies(req.headers.cookie);
    let sid = cookies[COOKIE_NAME];

    // Reuse existing valid session
    if (sid && store[sid]) {
        req.session = store[sid];
        req.sessionId = sid;
        // Refresh session TTL on activity to avoid unexpected logouts.
        // (The change is flushed to disk by the 5s autosave; logged-in state is
        //  saved immediately by the login/logout handlers via persist().)
        req.session.createdAt = Date.now();
        setCookie(req, res, sid);
        return next();
    }

    // Create a new session and set cookie immediately
    sid = randomId();
    store[sid] = { user: null, createdAt: Date.now() };
    req.session  = store[sid];
    req.sessionId = sid;
    setCookie(req, res, sid);

    next();
};

// Expose store so controller can write directly
module.exports.store = store;
// Expose persist so controllers can force-save right after login/logout.
module.exports.persist = persist;
