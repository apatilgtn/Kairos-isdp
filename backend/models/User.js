const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  uid: { type: String, required: true, unique: true },
  createdTime: { type: Number, required: true },
  lastLoginTime: { type: Number }
});

module.exports = mongoose.model('User', userSchema);
