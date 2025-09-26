import express from 'express';
import User from '../models/User.js';
import { convertToResponse, decrypt, encrypt } from '../utils/utility.js';
import { USER_ROLES } from '../constants/AppConstants.js';
import { generateRefreshToken, generateTokens } from '../services/authService.js';

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
    console.log(user);

    const decryptPassword = decrypt(user?.password);
    if (decryptPassword !== password) {
      return res.status(401).json(convertToResponse({}, 'Invalid username or password', 'error', false));
    }

    const accessToken = await generateTokens({ id: user._id, role: user.role });
    await user.save();

    return res.status(200).json(
      convertToResponse(
        {
          name: user.name,
          user_name: user.user_name,
          mobile: user.mobile,
          role: user.role,
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

export default router;
