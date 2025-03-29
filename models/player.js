const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  countryName: { type: String, required: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  position: { type: String, required: true },
  goals: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Player', playerSchema);