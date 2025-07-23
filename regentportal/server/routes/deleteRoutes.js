const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Student = require('../models/Student'); // Ensure this is already imported
const Teacher = require('../models/Teacher'); // Ensure this is already imported
// DELETE an admin by ID
router.delete('/deleteadmin/:id', async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);

    if (!deletedAdmin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully', id: deletedAdmin._id });
  } catch (err) {
    console.error('❌ Error deleting admin:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.delete('/deletestudent/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully', id: deletedStudent._id });
  } catch (err) {
    console.error('❌ Error deleting student:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/deleteteacher/:id', async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!deletedTeacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ message: 'Teacher deleted successfully', id: deletedTeacher._id });
  } catch (err) {
    console.error('❌ Error deleting teacher:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

