const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (username) user.username = username;
    if (phone) user.phone = phone;

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
