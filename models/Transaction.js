const mongoose = require('mongoose');
const TxSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['add','deduct','p2p'], default: 'p2p' },
  amount: Number,
  fromUser: String,
  toUser: String,
  note: String
}, { timestamps: true });
module.exports = mongoose.model('Transaction', TxSchema);
