const crypto = require('crypto');

// In-memory store: { sid: { user: null, createdAt: timestamp } }
const store = {};
const COOKIE_NAME = 'sid';
const MAX_AGE_MS  = 1000 * 60 * 60 * 24; // 24 h

// Prune expired sessions every hour
setInterval(() => {
    const now = Date.now();
    for (const id of Object.keys(store)) {
        if (now - store[id].createdAt > MAX_AGE_MS) delete store[id];
    }
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

function setCookie(res, sid) {
    // Use raw Set-Cookie header so it works before AND after redirect
    const cookie = `${COOKIE_NAME}=${sid}; Path=/; HttpOnly; Max-Age=${MAX_AGE_MS / 1000}`;
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
        // Refresh cookie lifetime on every request
        setCookie(res, sid);
        return next();
    }

    // Create a new session and set cookie immediately
    sid = randomId();
    store[sid] = { user: null, createdAt: Date.now() };
    req.session  = store[sid];
    req.sessionId = sid;
    setCookie(res, sid);

    next();
};

// Expose store so controller can write directly
module.exports.store = store;
