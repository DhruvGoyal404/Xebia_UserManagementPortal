const express = require('express');
const authController = require('../controllers/authController');
const upload = require('../utils/upload');

const router = express.Router();

router.post('/register', upload.single('profilePic'), authController.register);
router.post('/login', authController.login);

module.exports = router;
