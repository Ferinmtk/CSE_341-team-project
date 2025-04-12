const Attendance = require('../models/attendance');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Record new attendance
exports.recordAttendance = async (req, res) => {
  // Basic validation check (more specific validation will be in routes)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { studentId, courseId, date, status, notes } = req.body;

  try {
    // Optional: Add checks here to ensure studentId and courseId actually exist
    // in their respective collections before creating the attendance record.

    const newAttendance = new Attendance({
      studentId,
      courseId,
      date: date || Date.now(), // Use provided date or default to now
      status,
      notes
    });

    const savedAttendance = await newAttendance.save();
    res.status(201).json(savedAttendance); // 201 Created
  } catch (error) {
    console.error("Error recording attendance:", error);
    // Check for duplicate key error if you add unique constraints later
    res.status(500).json({ message: 'Error recording attendance', error: error.message });
  }
};

// Get all attendance records (with potential filtering)
exports.getAllAttendance = async (req, res) => {
  try {
    // Basic filtering example (can be expanded)
    const filter = {};
    if (req.query.studentId) {
      filter.studentId = req.query.studentId;
    }
    if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }
    // Add date range filtering if needed

    const attendanceRecords = await Attendance.find(filter)
                                        .populate('studentId', 'firstName lastName') // Populate student details
                                        .populate('courseId', 'courseName'); // Populate course details
    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: 'Error fetching attendance records', error: error.message });
  }
};

// Get a single attendance record by ID
exports.getAttendanceById = async (req, res) => {
  try {
    const attendanceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
        return res.status(400).json({ message: 'Invalid Attendance ID format' });
    }

    const attendanceRecord = await Attendance.findById(attendanceId)
                                        .populate('studentId', 'firstName lastName')
                                        .populate('courseId', 'courseName');

    if (!attendanceRecord) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(200).json(attendanceRecord);
  } catch (error) {
    console.error("Error fetching attendance by ID:", error);
    res.status(500).json({ message: 'Error fetching attendance record', error: error.message });
  }
};

// Update an attendance record
exports.updateAttendance = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const attendanceId = req.params.id;
    const updates = req.body; // Contains fields to update (e.g., status, notes, date)

    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
        return res.status(400).json({ message: 'Invalid Attendance ID format' });
    }

    // Ensure immutable fields like studentId/courseId aren't easily changed if needed
    // delete updates.studentId;
    // delete updates.courseId;

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      updates,
      { new: true, runValidators: true } // Return the updated document and run schema validators
    ).populate('studentId', 'firstName lastName').populate('courseId', 'courseName');

    if (!updatedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(200).json(updatedAttendance);
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: 'Error updating attendance record', error: error.message });
  }
};

// Delete an attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const attendanceId = req.params.id;

     if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
        return res.status(400).json({ message: 'Invalid Attendance ID format' });
    }

    const deletedAttendance = await Attendance.findByIdAndDelete(attendanceId);

    if (!deletedAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    // Send back the deleted record or just a success message
    // res.status(200).json({ message: 'Attendance record deleted successfully', record: deletedAttendance });
     res.status(204).send(); // 204 No Content is common for successful DELETE
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({ message: 'Error deleting attendance record', error: error.message });
  }
};