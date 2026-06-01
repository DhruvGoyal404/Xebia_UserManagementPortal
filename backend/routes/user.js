const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../utils/upload');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put(
  '/update-profile',
  upload.single('profilePic'),
  userController.updateProfile
);

module.exports = router;
