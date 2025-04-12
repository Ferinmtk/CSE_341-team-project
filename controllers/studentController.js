const Student = require("../models/student");
const Instructor = require("../models/instructor");

exports.createStudent = async (req, res) => {
  try {
    const students = Array.isArray(req.body) ? req.body : [req.body];
    const createdStudents = await Student.insertMany(students);

    for (const student of createdStudents) {
      const matchingInstructors = await Instructor.find({ course: student.favoriteSubject });
      if (matchingInstructors.length > 0) {
        student.instructors = matchingInstructors.map(inst => inst._id);
        await student.save();
        await Instructor.updateMany(
          { course: student.favoriteSubject },
          { $addToSet: { students: student._id } }
        );
      }
    }

    res.status(201).json(createdStudents);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate({
      path: "instructors",
      select: "firstName lastName email" 
    });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate({
      path: "instructors",
      select: "firstName lastName email" 
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    Object.assign(student, req.body);
    await student.save();

    await Instructor.updateMany(
      { students: student._id },
      { $pull: { students: student._id } }
    );
    const matchingInstructors = await Instructor.find({ course: student.favoriteSubject });
    if (matchingInstructors.length > 0) {
      student.instructors = matchingInstructors.map(inst => inst._id);
      await student.save();
      await Instructor.updateMany(
        { course: student.favoriteSubject },
        { $addToSet: { students: student._id } }
      );
    } else {
      student.instructors = [];
      await student.save();
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    await Instructor.updateMany(
      { students: student._id },
      { $pull: { students: student._id } }
    );
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;