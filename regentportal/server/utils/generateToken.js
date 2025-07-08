// utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (userId, userType) => {
  return jwt.sign({ userId, userType }, process.env.JWT_SECRET, {
    expiresIn: '3h'
  });
};

module.exports = generateToken;