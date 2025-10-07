import jwt from 'jsonwebtoken';
import Token from '../models/Token.js';

export const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ isAuthenticated: false, message: 'Token is not provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ isAuthenticated: false, message: 'Invalid or expired token' });
      }
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        return res.status(401).json({ isAuthenticated: false, message: 'Token not found' });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ isAuthenticated: false, message: 'Server error' });
  }
};
