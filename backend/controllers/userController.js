const User = require('../models/User');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (phone) user.phone = phone;

    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer);
        user.profilePic = result.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error (update):', uploadErr.message);
        return res
          .status(500)
          .json({ message: 'Failed to upload profile picture' });
      }
    }

    await user.save();

    const safe = user.toObject();
    delete safe.password;
    res.json({ message: 'Profile updated', user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
