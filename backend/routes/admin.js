const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Pending registration requests
router.get('/pending-requests', adminController.getPendingRequests);
router.post('/approve-request/:requestId', adminController.approveRequest);
router.post('/reject-request/:requestId', adminController.rejectRequest);

// User management
router.get('/all-users', adminController.getAllUsers);
router.post('/toggle-user-status/:userId', adminController.toggleUserStatus);

// Admin management
router.post('/create-admin', adminController.createAdmin);

// Dashboard stats
router.get('/dashboard-stats', adminController.getDashboardStats);

module.exports = router;
