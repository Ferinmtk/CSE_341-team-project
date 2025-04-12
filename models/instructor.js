const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  course: { type: String, required: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true },
  qualification: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Array of student IDs
  createdAt: { type: Date, default: Date.now },
  }, 
  {
  versionKey: false // Disable __v
});

module.exports = mongoose.model("Instructor", instructorSchema);