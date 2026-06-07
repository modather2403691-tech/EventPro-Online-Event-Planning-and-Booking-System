const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const requireAdmin = require('../middleware/adminAuth');

router.use(requireAdmin);

// Route to display the manage users page
router.get('/users', adminController.getManageUsers);

// Route to handle the form submission for adding a user
router.post('/users', adminController.addUser);

// Route to handle editing a user via AJAX
router.post('/users/edit', adminController.editUser);

// Route to check if a userId is already taken (AJAX)
router.get('/users/check-id', adminController.checkUserId);

module.exports = router;
