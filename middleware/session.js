const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');


const store = {};
const BOOT_ID = crypto.randomBytes(16).toString('hex');
const COOKIE_NAME = 'sid';
const MAX_AGE_MS  = 1000 * 60 * 60 * 24 * 30; 

function persist() {
   
}


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
  
    const parts = [
        `${COOKIE_NAME}=${sid}`,
        'Path=/',
        'HttpOnly',
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

function bumpLastActive(user) {
    if (!user || !user.email) {
        return;
    }

    const email = String(user.email).trim();
    if (!email) {
        return;
    }

    User.findOneAndUpdate({ email }, { lastActiveAt: new Date() }).catch(err => {
        console.error('Session lastActive update failed:', err.message);
    });
}

module.exports = function sessionMiddleware(req, res, next) {
    const cookies = parseCookies(req.headers.cookie);
    let sid = cookies[COOKIE_NAME];

    
    if (sid && store[sid]) {
        req.session = store[sid];
        req.sessionId = sid;

        req.session.createdAt = Date.now();
        setCookie(req, res, sid);
        return next();
    }

   
    sid = randomId();
    store[sid] = { user: null, createdAt: Date.now() };
    req.session  = store[sid];
    req.sessionId = sid;
    setCookie(req, res, sid);

    next();
};


module.exports.store = store;
module.exports.bootId = BOOT_ID;

module.exports.persist = persist;
