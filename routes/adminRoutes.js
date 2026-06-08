const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const requireAdmin = require('../middleware/adminAuth');

router.use(requireAdmin);


router.get('/users', adminController.getManageUsers);


router.get('/messages', adminController.getMessages);


router.post('/messages/delete', adminController.deleteMessage);


router.post('/users', adminController.addUser);


router.post('/users/edit', adminController.editUser);


router.post('/users/delete', adminController.deleteUser);

module.exports = router;
