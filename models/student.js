const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  favoriteSubject: { type: String, required: true },
  grade: { type: String, required: true },
  email: { type: String, required: true },
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Instructor" }], // Array of instructor IDs
  createdAt: { type: Date, default: Date.now },
  },
{
  versionKey: false // Disable __v
});

module.exports = mongoose.model("Student", studentSchema);