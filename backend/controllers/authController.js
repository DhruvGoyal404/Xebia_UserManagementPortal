const User = require('../models/User');
const RegistrationRequest = require('../models/RegistrationRequest');
const jwt = require('jsonwebtoken');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');

// User Registration
exports.register = async (req, res) => {
  try {
    const { username, email, phone, password, confirmPassword } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let profilePicUrl = null;
    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer);
        profilePicUrl = result.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error (register):', uploadErr.message);
        return res
          .status(500)
          .json({ message: 'Failed to upload profile picture' });
      }
    }

    const user = new User({
      username,
      email,
      phone,
      password,
      profilePic: profilePicUrl,
      role: 'user',
      isActive: false,
      isApproved: false,
    });

    await user.save();

    const regRequest = new RegistrationRequest({
      userId: user._id,
      username,
      email,
      phone,
      profilePic: profilePicUrl,
      status: 'pending',
    });

    await regRequest.save();

    res.status(201).json({
      message: 'Registration request submitted. Awaiting admin approval.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
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
