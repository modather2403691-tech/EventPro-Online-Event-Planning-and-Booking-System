const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Route to display the manage users page
router.get('/users', adminController.getManageUsers);

// Route to handle the form submission for adding a user
router.post('/users', adminController.addUser);

// Route to handle editing a user via AJAX
router.post('/users/edit', adminController.editUser);
router.get('/messages', adminController.getMessages);
module.exports = router;
