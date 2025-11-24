// /controllers/authController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with that email already exists');
  }
  const user = await User.create({ name, email, password });
  if (user) {
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } else {
    res.status(400);
    throw new Error('Invalid user data received');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.status(200).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const getMe = asyncHandler(async (req, res) => {
    const user = { _id: req.user._id, email: req.user.email, name: req.user.name };
    res.status(200).json(user);
});

module.exports = { registerUser, loginUser, getMe };