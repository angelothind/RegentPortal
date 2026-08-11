const Admin = require('../models/Admin');

const createAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const newAdmin = new Admin({
      username,
      password: password // Let the Admin model's pre('save') hook handle the hashing
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully', username: newAdmin.username });
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const listAdmins = async (req, res) => {
  console.log('In lookupadmins route');
  try {
    const admins = await Admin.find({}, 'username');
    console.log('Found admins:', admins);
    res.json({ admins });
  } catch (err) {
    console.error('❌ Error fetching admins:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteAdmin = async (req, res) => {
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
};

module.exports = { createAdmin, listAdmins, deleteAdmin };
