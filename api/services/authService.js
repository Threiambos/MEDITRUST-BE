import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Token from '../models/Token.js';

dotenv.config();

const { TOKEN_SECRET, REFRESH_TOKEN_SECRET, JWT_ACCESS_TOKEN_EXPIRES_TIME, JWT_REFRESH_TOKEN_EXPIRES_TIME } = process.env;

/**
 * Generate and save a new access token for a user
 * @param {Object} user - User object
 * @returns {Object} - Access token object
 */
export const generateTokens = async (user) => {
  try {
    const payload = { _id: user._id, role: user.role };

    const accessToken = jwt.sign(payload, TOKEN_SECRET, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRES_TIME,
    });

    // Remove old token if exists
    await Token.findOneAndDelete({ user_id: user._id });

    // Save new token
    await new Token({ user_id: user._id, token: accessToken }).save();

    return accessToken;
  } catch (error) {
    console.error('Error generating tokens:', error);
    throw error;
  }
};

/**
 * Generate a refresh token
 * @param {Object} param0 - Object containing user id and role
 * @returns {String} - Refresh token
 */
export const generateRefreshToken = ({ id, role }) => {
  try {
    const payload = { _id: id, roles: role };

    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRES_TIME,
    });
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw error;
  }
};
