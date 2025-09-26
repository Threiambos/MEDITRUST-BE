import express from 'express';
import jwt from 'jsonwebtoken';
import { USER_ROLES } from '../constants/AppConstants.js';
import Token from '../models/Token.js';
import User from '../models/User.js';
import { generateRefreshToken, generateTokens } from '../services/authService.js';
import { convertToResponse, decrypt, encrypt } from '../utils/utility.js';

const router = express.Router();

/**
 * @route   POST /api/auth/create-account
 * @desc    Create a new user account and generate refresh token
 * @access  Public
 */
router.post('/create-account', async (req, res) => {
  const { name, user_name, mobile, password, role = USER_ROLES.RECEPTIONIST } = req.body;

  try {
    const existingUser = await User.findOne({ user_name });
    if (existingUser) {
      return res.status(400).json(convertToResponse({}, 'User already exists, please use another username', 'error', false));
    }

    const encryptedPassword = encrypt(password);
    const user = new User({
      name,
      user_name,
      mobile,
      role,
      password: encryptedPassword,
    });

    const newUser = await user.save();

    const refreshToken = generateRefreshToken({ id: newUser._id, role: newUser.role });

    newUser.refresh_token = refreshToken;
    await newUser.save();

    return res.status(201).json(
      convertToResponse(
        {
          name: newUser.name,
          user_name: newUser.user_name,
          mobile: newUser.mobile,
          role: newUser.role,
        },
        'User created successfully',
        'success',
        true,
      ),
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json(convertToResponse({}, error?.message || 'Internal server error', 'error', false));
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login a user and generate refresh token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { user_name, password } = req.body;
  try {
    const user = await User.findOne({ user_name });
    if (!user) {
      return res.status(401).json(convertToResponse({}, 'Invalid username or password', 'error', false));
    }
    const decryptPassword = decrypt(user?.password);
    if (decryptPassword !== password) {
      return res.status(401).json(convertToResponse({}, 'Invalid username or password', 'error', false));
    }

    const accessToken = await generateTokens({ id: user._id, role: user.role });
    await user.save();

    return res.status(200).json(
      convertToResponse(
        {
          user: { name: user.name, user_name: user.user_name, mobile: user.mobile, role: user.role },
          access_token: accessToken,
          refresh_token: user.refresh_token,
        },
        'Login successful',
        'success',
        true,
      ),
    );
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json(convertToResponse({}, error?.message || 'Internal server error', 'error', false));
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout the User
 * @access  Public
 */
router.post('/logout', async (req, res) => {
  const authHeader = req.headers['authorization'];

  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ isAuthenticated: false, message: 'Invalid Token' });
    }

    const token = authHeader.split(' ')[1];
    await Token.findOneAndDelete({ token });
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/check-isAuthenticate
 * @desc    Check if the user is authenticated
 * @access  Public
 */
router.get('/check-isAuthenticate', async (req, res) => {
  const authHeader = req.headers['authorization'];

  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ isAuthenticated: false, message: 'Invalid Token' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ isAuthenticated: false, message: 'Invalid or expired token' });
      }
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        return res.status(401).json({ isAuthenticated: false, message: 'Token not found' });
      }

      return res.status(200).json({ isAuthenticated: true, message: 'Token is valid', user: decoded });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ isAuthenticated: false, message: 'Server error' });
  }
});

export default router;
