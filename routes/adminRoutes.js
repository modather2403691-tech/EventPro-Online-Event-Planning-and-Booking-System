const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const requireAdmin = require('../middleware/adminAuth');

router.use(requireAdmin);

// Route to display the manage users page
router.get('/users', adminController.getManageUsers);

// Route to display contact messages
router.get('/messages', adminController.getMessages);

// Route to delete a contact message
router.post('/messages/delete', adminController.deleteMessage);

// Route to handle the form submission for adding a user
router.post('/users', adminController.addUser);

// Route to handle editing a user via AJAX
router.post('/users/edit', adminController.editUser);

module.exports = router;
