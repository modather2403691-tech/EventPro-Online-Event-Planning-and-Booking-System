require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const sessionMiddleware = require('./middleware/session');
const authRoutes = require('./routes/authRoutes');
// --- ADD THIS LINE TO IMPORT ADMIN ROUTES ---
const adminRoutes = require('./routes/adminRoutes'); 
const adminController = require('./controllers/adminController');
const requireAdmin = require('./middleware/adminAuth');


const app = express();

// 1. Middlewares
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json({ limit: '5mb' })); // needed for base64 photo uploads
app.use(sessionMiddleware); // session must be before routes
app.use(express.static(path.join(__dirname, 'public')));

// 2. Setup EJS
app.set('view engine', 'ejs');
// لو ملفات الـ ejs بتاعتك في فولدر اسمه views (وده الصح)، السطر ده بيأكد المسار
app.set('views', path.join(__dirname, 'views')); 

// 3. Database Connection (MongoDB Atlas)
// Require `MONGO_URI` to be set in the environment for security.
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('Missing MONGO_URI environment variable. Create a .env file or set MONGO_URI in the environment.');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });


// 4. Routes
// أي مسار هيبدأ بـ / هيروح يدور فيnode event.js ملف الـ authRoutes
app.use('/', authRoutes);



app.use('/admin', adminRoutes);

// Fallback direct route for user edits in case the mounted router is bypassed
app.post('/admin/users/edit', requireAdmin, adminController.editUser);
app.get('/admin-dashboard/export-csv', requireAdmin, adminController.exportReportsCsv);

// 404 — any unmatched route renders the custom not-found page
app.use((req, res) => {
    res.status(404).render('404');
});

// 5. Start the Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`EventPro server is running on http://localhost:${PORT}`);
});