import mongoose, { Schema } from 'mongoose';
import { USER_ROLES } from '../constants/AppConstants.js';

const User = new Schema({
  name: {
    type: String,
    max: 3266,
    required: true,
    min: 6,
  },

  mobile: {
    type: String,
    max: 8979797,
    min: 10,
  },

  user_name: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    max: 1022,
    min: 8,
    required: true,
  },

  role: {
    type: String,
    default: USER_ROLES.RECEPTIONIST,
  },

  refresh_token: {
    type: String,
    max: 898898898,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

  updated_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', User);
