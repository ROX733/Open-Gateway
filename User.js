const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  apiKey: { type: String, unique: true },
  isAdmin: { type: Boolean, default: false },
  telegramId: String
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);
