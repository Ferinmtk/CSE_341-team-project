const Instructor = require("../models/instructor");
const Student = require("../models/student");

exports.createInstructor = async (req, res) => {
  try {
    const instructors = Array.isArray(req.body) ? req.body : [req.body];
    const createdInstructors = await Instructor.insertMany(instructors);

    for (const instructor of createdInstructors) {
      const matchingStudents = await Student.find({ favoriteSubject: instructor.course });
      if (matchingStudents.length > 0) {
        instructor.students = matchingStudents.map(stu => stu._id);
        await instructor.save();
        await Student.updateMany(
          { favoriteSubject: instructor.course },
          { $addToSet: { instructors: instructor._id } }
        );
      }
    }

    res.status(201).json(createdInstructors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find().populate({
      path: "students",
      select: "firstName lastName email"
    });
    res.status(200).json(instructors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInstructorById = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id).populate({
      path: "students",
      select: "firstName lastName email" 
    });
    if (!instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }
    res.status(200).json(instructor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    Object.assign(instructor, req.body);
    await instructor.save();

    await Student.updateMany(
      { instructors: instructor._id },
      { $pull: { instructors: instructor._id } }
    );
    const matchingStudents = await Student.find({ favoriteSubject: instructor.course });
    if (matchingStudents.length > 0) {
      instructor.students = matchingStudents.map(stu => stu._id);
      await instructor.save();
      await Student.updateMany(
        { favoriteSubject: instructor.course },
        { $addToSet: { instructors: instructor._id } }
      );
    } else {
      instructor.students = [];
      await instructor.save();
    }

    res.status(200).json(instructor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndDelete(req.params.id);
    if (!instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }
    await Student.updateMany(
      { instructors: instructor._id },
      { $pull: { instructors: instructor._id } }
    );
    res.status(200).json({ message: "Instructor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;