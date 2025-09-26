import mongoose, { Schema } from 'mongoose';

const Token = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    require: true,
  },
  token: {
    type: String,
    require: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    expires: 30 * 86400,
  },
});

export default mongoose.model('Token', Token);
