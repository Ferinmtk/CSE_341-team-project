const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student', // Assumes you have a 'Student' model
    required: [true, 'Student ID is required']
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course', // Assumes you have a 'Course' model
    required: [true, 'Course ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now // Defaults to the current date/time when the record is created
  },
  status: {
    type: String,
    required: [true, 'Attendance status is required'],
    enum: {
      values: ['Present', 'Absent', 'Late'],
      message: '{VALUE} is not a supported status (Present, Absent, Late)'
    }
  },
  notes: { // Optional field for any remarks
    type: String,
    trim: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Attendance', attendanceSchema);