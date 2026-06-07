const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const sessionMiddleware = require('./middleware/session');
const authRoutes = require('./routes/authRoutes');
// --- ADD THIS LINE TO IMPORT ADMIN ROUTES ---
const adminRoutes = require('./routes/adminRoutes'); 
const adminController = require('./controllers/adminController');


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
// حط اللينك بتاع الـ Cluster0 بتاعك هنا بدل الـ <username> و الـ <password>
const MONGO_URI = 'mongodb://modather2403691_db_user:Mody1234@ac-fdnr0yo-shard-00-00.o2ac2oh.mongodb.net:27017,ac-fdnr0yo-shard-00-01.o2ac2oh.mongodb.net:27017,ac-fdnr0yo-shard-00-02.o2ac2oh.mongodb.net:27017/eventpro?ssl=true&replicaSet=atlas-10hhdt-shard-0&authSource=admin&appName=Cluster0';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Cluster0 successfully!'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));


// 4. Routes
// أي مسار هيبدأ بـ / هيروح يدور فيnode event.js ملف الـ authRoutes
app.use('/', authRoutes);



app.use('/admin', adminRoutes);

// Fallback direct route for user edits in case the mounted router is bypassed
app.post('/admin/users/edit', adminController.editUser);
app.get('/admin-dashboard/export-csv', adminController.exportReportsCsv);

// 404 — any unmatched route renders the custom not-found page
app.use((req, res) => {
    res.status(404).render('404');
});

// 5. Start the Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`EventPro server is running on http://localhost:${PORT}`);
});