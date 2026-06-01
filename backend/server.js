const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in production for now (can be restricted later)
    // In production, you might want to restrict to your frontend URL
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(fileUpload());

// Only serve uploads in development (Vercel doesn't have persistent filesystem)
if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static('uploads'));
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'User Management Portal API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
