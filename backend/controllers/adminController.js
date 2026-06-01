const User = require('../models/User');
const RegistrationRequest = require('../models/RegistrationRequest');
const { sendApprovalEmail } = require('../utils/mailer');

// Get all pending registration requests
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await RegistrationRequest.find({ status: 'pending' });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve registration request
exports.approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await RegistrationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update registration request
    request.status = 'approved';
    request.approvedBy = req.user.id;
    await request.save();

    // Activate user
    const user = await User.findById(request.userId);
    user.isApproved = true;
    user.isActive = true;
    await user.save();

    // Send approval email (don't block response on email failures)
    sendApprovalEmail({ to: user.email, username: user.username }).catch(
      (mailErr) => console.error('Approval email failed:', mailErr.message)
    );

    res.json({ message: 'Request approved successfully', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject registration request
exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const request = await RegistrationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = 'rejected';
    request.rejectionReason = reason;
    await request.save();

    // Delete user if rejected
    await User.findByIdAndDelete(request.userId);

    res.json({ message: 'Request rejected', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Activate/Deactivate user
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new admin
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // Validation
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Admin with this email/username already exists' });
    }

    // Create new admin
    const admin = new User({
      username,
      email,
      phone,
      password,
      role: 'admin',
      isActive: true,
      isApproved: true,
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({
      role: 'user',
      isActive: true,
    });
    const pendingRequests = await RegistrationRequest.countDocuments({
      status: 'pending',
    });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    res.json({
      totalUsers,
      activeUsers,
      pendingRequests,
      totalAdmins,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
