const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

console.log('Users routes file loaded');

const router = express.Router();

// Multer config for profile photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX) are allowed'), false);
    }
  }
});

// Disposable email domains check
const disposableEmails = ['guerrillamail.com', 'temp-mail.org', '10minutemail.com']; // Add more as needed

// Register - direct user creation without OTP
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').custom(email => {
    const domain = email.split('@')[1];
    if (disposableEmails.some(d => domain.includes(d))) {
      throw new Error('Disposable emails not allowed');
    }
    return true;
  }),
  body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('aadhaar').optional().matches(/^\d{12}$/).withMessage('Aadhaar must be 12 digits')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, password, aadhaar, addresses } = req.body;

  // Log IP for behavioral analysis
  console.log(`Registration attempt from IP: ${req.ip} for email: ${email}, phone: ${phone}`);

  try {
    // Check if user already exists
    const existingEmail = await User.findOne({ email });
    const existingPhone = await User.findOne({ phone });

    if (existingEmail && existingPhone) {
      return res.status(400).json({ error: 'Email and phone already exist' });
    } else if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    } else if (existingPhone) {
      return res.status(400).json({ error: 'Phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      password_hash: hashedPassword,
      aadhaar: aadhaar || null,
      status: 'active',
      email_verified: true,
      phone_verified: true,
      role: 'consumer',
      addresses: addresses || []
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully. You can now log in.' });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email or phone already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Farmer Register - with additional fields
router.post('/farmer-register', upload.single('idProof'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').custom(email => {
    const domain = email.split('@')[1];
    if (disposableEmails.some(d => domain.includes(d))) {
      throw new Error('Disposable emails not allowed');
    }
    return true;
  }),
  body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('farmName').notEmpty().withMessage('Farm name is required'),
  body('location').notEmpty().withMessage('Location is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, password, farmName, location } = req.body;
  const idProof = req.file;

  // Log IP for behavioral analysis
  console.log(`Farmer registration attempt from IP: ${req.ip} for email: ${email}, phone: ${phone}`);

  try {
    // Check if user already exists
    const existingEmail = await User.findOne({ email });
    const existingPhone = await User.findOne({ phone });

    if (existingEmail && existingPhone) {
      return res.status(400).json({ error: 'Email and phone already exist' });
    } else if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    } else if (existingPhone) {
      return res.status(400).json({ error: 'Phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const idProofPath = idProof ? `/uploads/${idProof.filename}` : null;

    const { farmSize, farmingType, experience, certifications } = req.body;

    const user = new User({
      name,
      email,
      phone,
      password_hash: hashedPassword,
      status: 'active',
      email_verified: true,
      phone_verified: true,
      role: 'farmer',
      farm_name: farmName,
      location,
      farm_size: farmSize || null,
      farming_type: farmingType,
      experience: experience || null,
      certifications: certifications || [],
      id_proof: idProofPath
    });

    const savedUser = await user.save();
    const token = jwt.sign({ id: savedUser._id, email: savedUser.email, role: 'farmer' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Farmer registration successful! You can now access your dashboard.',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: 'farmer',
        phone_verified: true,
        email_verified: true
      }
    });
  } catch (error) {
    console.error('Farmer registration error:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email or phone already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});


// Login
router.post('/login', async (req, res) => {
  console.log('Login route called with body:', req.body);
  const { email, password } = req.body;
  console.log('Login attempt for email:', email);

  try {
    console.log('Finding user...');
    const user = await User.findOne({ email });
    console.log('User found:', !!user);

    if (!user) {
      console.log('User not found');
      return res.status(400).json({ error: 'User not found' });
    }

    console.log('User status:', user.status);
    console.log('User role:', user.role);

    console.log('Comparing password...');
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Invalid password');
      return res.status(400).json({ error: 'Invalid password' });
    }

    if (user.status !== 'active') {
      console.log('Account not active');
      return res.status(403).json({ error: 'Account not verified or blocked' });
    }

    console.log('Generating token...');
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone_verified: user.phone_verified,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin middleware
const adminAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password_hash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users - Get all users (public endpoint for listing users)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ status: 'active' }).select('name email phone role farm_name location created_at');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID (admin only)
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password_hash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user status (admin only)
router.put('/users/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    await User.findByIdAndUpdate(id, { status });
    res.json({ message: 'User status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// User middleware
const userAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Get user profile (including addresses)
router.get('/profile', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', userAuth, upload.single('photo'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').optional(),
  body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits').optional(),
  body('address').optional().isLength({ min: 1 }).withMessage('Address is required if provided')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const { name, email, phone, address, email_notifications, push_notifications, sms_notifications } = req.body;
  let profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Check if email or phone changed and unique
    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone already exists' });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (profilePhoto) updateData.profile_photo = profilePhoto;
    if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
    if (push_notifications !== undefined) updateData.push_notifications = push_notifications;
    if (sms_notifications !== undefined) updateData.sms_notifications = sms_notifications;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password_hash');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});



// Add address (user authenticated) - direct without OTP
router.post('/add-address', userAuth, [
  body('address').notEmpty().withMessage('Address is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { address } = req.body;
  const userId = req.user.id;

  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        addresses: { address, verified: true }
      }
    });

    res.json({ message: 'Address added successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Get user addresses
router.get('/addresses', userAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select('addresses');
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Change password
router.put('/change-password', userAuth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password_hash: hashedNewPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Contact form submission (public)
router.post('/contact', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, message } = req.body;

  try {
    // For now, just log the contact message. In production, save to DB or send email.
    console.log(`Contact form submission: Name: ${name}, Email: ${email}, Message: ${message}`);
    res.json({ message: 'Thank you for contacting us. We will get back to you soon.' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// GET /api/users/notifications - Get user's notifications
router.get('/notifications', userAuth, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .limit(50); // Limit to last 50 notifications

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', userAuth, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/notifications/mark-all-read - Mark all notifications as read
router.put('/notifications/mark-all-read', userAuth, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.updateMany(
      { user_id: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/notifications/unread-count - Get unread notifications count
router.get('/notifications/unread-count', userAuth, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const count = await Notification.countDocuments({
      user_id: req.user.id,
      read: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
