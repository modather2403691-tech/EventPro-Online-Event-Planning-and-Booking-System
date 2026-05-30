const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/authRoutes'); // اتأكد إن المسار صح

const app = express();

// 1. Middlewares (مهم جداً عشان نقرا الداتا من الـ forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// السطر ده بيخلي إكسبريس يقرا ملفات الـ CSS والصور
app.use(express.static(path.join(__dirname, 'public')));

// 2. Setup EJS
app.set('view engine', 'ejs');
// لو ملفات الـ ejs بتاعتك في فولدر اسمه views (وده الصح)، السطر ده بيأكد المسار
app.set('views', path.join(__dirname, 'views')); 

// 3. Database Connection (MongoDB Atlas)
// حط اللينك بتاع الـ Cluster0 بتاعك هنا بدل الـ <username> و الـ <password>
// 3. Database Connection (MongoDB Atlas)
const MONGO_URI = 'mongodb://modather2403691_db_user:Mody1234@ac-fdnr0yo-shard-00-00.o2ac2oh.mongodb.net:27017,ac-fdnr0yo-shard-00-01.o2ac2oh.mongodb.net:27017,ac-fdnr0yo-shard-00-02.o2ac2oh.mongodb.net:27017/eventpro?ssl=true&replicaSet=atlas-10hhdt-shard-0&authSource=admin&appName=Cluster0';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB Cluster0 successfully!'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));


// 4. Routes
// أي مسار هيبدأ بـ / هيروح يدور فيnode event.js ملف الـ authRoutes
app.use('/', authRoutes);

// 5. Start the Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`EventPro server is running on http://localhost:${PORT}`);
});