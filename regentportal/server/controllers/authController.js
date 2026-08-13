const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const generateToken = require('../utils/generateToken');

const login = async (req, res) => {
  const { username, password, userType } = req.body;
  try {
    let user;
    if (userType === 'Teacher') {
      // Check Admins first
      try {
        user = await Admin.findOne({ username });
        if (user) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (isMatch) {
            const token = generateToken(user._id, userType);
            return res.status(200).json({
              message: 'Login successful',
              user: { _id: user._id, username, userType: 'Admin' },
              token
            });
          } else {
            return res.status(401).json({ error: 'Invalid password' });
          }
        }
      } catch (adminError) {
        console.error('Error querying Admin collection:', adminError);
      }

      // If not admin, check Teachers
      user = await Teacher.findOne({ username });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const token = generateToken(user._id, userType);
          return res.status(200).json({
            message: 'Login successful',
            user: { _id: user._id, username, userType },
            token
          });
        } else {
          return res.status(401).json({ error: 'Invalid password' });
        }
      }

      return res.status(404).json({ error: 'Teacher not found' });
    } else if (userType === 'Student') {
      user = await Student.findOne({ username });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const token = generateToken(user._id, userType);
          return res.status(200).json({
            message: 'Login successful',
            user: { _id: user._id, username, userType },
            token
          });
        } else {
          return res.status(401).json({ error: 'Invalid password' });
        }
      }

      return res.status(404).json({ error: 'Student not found' });
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { login };
