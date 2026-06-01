const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/update-profile', userController.updateProfile);

module.exports = router;
