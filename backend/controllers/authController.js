const User = require('../models/User');
const RegistrationRequest = require('../models/RegistrationRequest');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// User Registration
exports.register = async (req, res) => {
  try {
    const { username, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      phone,
      password,
      role: 'user',
      isActive: false,
      isApproved: false,
    });

    // Handle profile picture upload (only in development)
    if (req.files && req.files.profilePic && process.env.NODE_ENV === 'development') {
      const file = req.files.profilePic;
      const uploadDir = path.join(__dirname, '../uploads');
      
      // Ensure uploads directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filename = `${Date.now()}_${file.name}`;
      const uploadPath = path.join(uploadDir, filename);

      await file.mv(uploadPath);
      user.profilePic = `/uploads/${filename}`;
    } else if (req.files && req.files.profilePic) {
      // In production, files are not persisted (use external storage like AWS S3 or Cloudinary)
      console.log('Profile picture upload attempted in production. Use external storage service.');
    }

    await user.save();

    // Create registration request
    const regRequest = new RegistrationRequest({
      userId: user._id,
      username,
      email,
      phone,
      profilePic: user.profilePic,
      status: 'pending',
    });

    await regRequest.save();

    res.status(201).json({
      message:
        'Registration request submitted. Awaiting admin approval.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.role !== 'admin' && !user.isApproved) {
      return res
        .status(403)
        .json({ message: 'Your registration is pending admin approval' });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: 'Your account has been deactivated' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
