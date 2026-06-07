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


app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json({ limit: '5mb' })); // needed for base64 photo uploads
app.use(sessionMiddleware); // session must be before routes
app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views')); 


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



app.use('/', authRoutes);



app.use('/admin', adminRoutes);


app.post('/admin/users/edit', requireAdmin, adminController.editUser);
app.get('/admin-dashboard/export-csv', requireAdmin, adminController.exportReportsCsv);


app.use((req, res) => {
    res.status(404).render('404');
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`EventPro server is running on http://localhost:${PORT}`);
});