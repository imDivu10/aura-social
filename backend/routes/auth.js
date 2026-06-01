const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { generateVerificationToken, sendVerificationEmail } = require('../utils/email');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user = new User({ 
      username, 
      email, 
      password,
      verificationToken,
      verificationTokenExpires
    });
    
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken, username);

    res.status(201).json({ 
      message: 'Registration successful! Please check your email to verify your account.',
      email: email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.json({ 
      message: 'Email verified successfully! You can now login.',
      verified: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'Email not verified. Please check your email for verification link.',
        verified: false
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = generateToken(user._id);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        isVerified: user.isVerified
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Check rate limiting (max 3 attempts per hour)
    if (user.verificationAttempts >= 3) {
      const timeDiff = Date.now() - user.verificationAttemptTime;
      if (timeDiff < 60 * 60 * 1000) {
        return res.status(429).json({ error: 'Too many attempts. Try again later.' });
      }
      user.verificationAttempts = 0;
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    user.verificationAttempts += 1;
    user.verificationAttemptTime = new Date();
    await user.save();

    // Send new verification email
    await sendVerificationEmail(email, verificationToken, user.username);

    res.json({ 
      message: 'Verification email sent! Please check your email.',
      email: email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Current User
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout (client-side, just delete token)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
