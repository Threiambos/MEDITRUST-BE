/**
 * @file userRoutes.js
 * @description Defines all user management routes, including listing users,
 * filtering by role, retrieving by ID, updating, and deleting.
 *
 * Base URL: /api/users
 */

import express from 'express';
import User from '../models/User.js';
import { convertToResponse, getUserFromToken } from '../utils/utility.js';
import { USER_ROLES } from '../constants/AppConstants.js';

const router = express.Router();

/**
 * @route   GET /api/users/list
 * @desc    Retrieve a list of all users except those with the role 'ADMIN'
 * @access  Public or Protected (depending on middleware applied)
 * @returns {Array} JSON array of user objects
 *
 * @example
 * GET /api/users/list
 * Response: [{ "_id": "123", "name": "John Doe", "role": "USER" }, ...]
 */
router.get('/list', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: USER_ROLES.ADMIN } }, '-password -refresh_token -__v');

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/users/role/:role
 * @desc    Retrieve users by their role (e.g., USER, MANAGER)
 * @param   {String} role - The role to filter users by
 * @access  Public or Protected (depending on middleware applied)
 * @returns {Array} JSON array of user objects with the specified role
 *
 * @example
 * GET /api/users/role/USER
 * Response: [{ "_id": "123", "name": "Jane Doe", "role": "USER" }, ...]
 */
router.get('/role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Retrieve a single user by their unique ID
 * @param   {String} id - The user ID
 * @access  Public or Protected (depending on middleware applied)
 * @returns {Object} JSON object of the user
 *
 * @example
 * GET /api/users/652ab12c34d89e001234abcd
 * Response: { "_id": "652ab12c34d89e001234abcd", "name": "John Doe", "role": "USER" }
 */
/**
 * @route   GET /api/users/:id
 * @desc    Retrieve user details by ID
 * @param   {String} id - The user ID
 * @access  Protected (ADMIN or same user)
 */
router.get('/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);

    if (!decoded) {
      return res.status(401).json({ isAuthenticated: false, message: 'Invalid Token' });
    }

    const { id } = req.params;

    if (decoded.role !== USER_ROLES.ADMIN && decoded.id !== id) {
      return res.status(403).json({ message: 'You are not eligible for this operation' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user details by ID
 * @param   {String} id - The user ID
 * @access  Protected (ADMIN or same user)
 */
router.put('/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);

    if (!decoded) {
      return res.status(401).json({ isAuthenticated: false, message: 'Invalid Token' });
    }

    const { id } = req.params;

    if (decoded.role !== USER_ROLES.ADMIN && decoded.id !== id) {
      return res.status(403).json({ message: 'You are not eligible for this operation' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user by ID
 * @param   {String} id - The user ID
 * @access  Protected (ADMIN or same user)
 */
router.delete('/:id', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) {
      return res.status(401).json({ isAuthenticated: false, message: 'Invalid Token' });
    }

    const { id } = req.params;

    // Restrict non-admins from deleting others
    if (decoded.role !== USER_ROLES.ADMIN && decoded.id !== id) {
      return res.status(403).json({ message: 'You are not eligible for this operation' });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;
