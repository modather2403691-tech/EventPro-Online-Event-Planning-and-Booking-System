const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 1. مسارات الـ GET (لعرض الصفحات)
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// في ملف routes/authRoutes.js

// مسار الكلاينت
router.get('/client-index', (req, res) => {
    res.render('client-index'); // تأكد إن الملف اسمه client-index.ejs
});

// مسار المنظم
router.get('/organizer-index', (req, res) => {
    res.render('organizer-index'); // تأكد إن الملف اسمه organizer-index.ejs
});

router.get('/admin-index', (req, res) => {
    res.render('admin-index');
});

// 2. مسارات الـ POST (لإرسال بيانات الـ Forms)
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;