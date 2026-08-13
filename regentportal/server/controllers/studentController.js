const Student = require('../models/Student');

const createStudent = async (req, res) => {
  const { name, nickname, username, password } = req.body;

  try {
    const existingStudent = await Student.findOne({ username });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student already exists' });
    }

    const newStudent = new Student({ name, nickname, username, password });

    await newStudent.save();
    res.status(201).json({ message: 'Student created', _id: newStudent._id });
  } catch (err) {
    console.error('Error creating student:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const listStudents = async (req, res) => {
  try {
    const students = await Student.find({}, 'name nickname username'); // include nickname field
    res.json({ students });
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully', id: deletedStudent._id });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createStudent, listStudents, deleteStudent };
