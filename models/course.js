const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true }, 
  title: { type: String, required: true }, 
  department: { type: String, required: true }, 
  schedule: { type: String, required: true }, 
  room: { type: String, required: true }, 
  credits: { type: Number, required: true }, // e.g., 3
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Instructor" }], 
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], 
  createdAt: { type: Date, default: Date.now },
},
{
  versionKey: false // Disable __v
});

module.exports = mongoose.model("Course", courseSchema);