// /controllers/authController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

const AUTH_COOKIE = 'wanderease_token';
const isProductionDeployment = process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER_EXTERNAL_URL);
const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.COOKIE_SAME_SITE || (isProductionDeployment ? 'none' : 'lax'),
  secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProductionDeployment,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const generateToken = (user) => {
  return jwt.sign({ id: user._id, tokenVersion: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const setAuthCookie = (res, user) => {
  res.cookie(AUTH_COOKIE, generateToken(user), {
    ...cookieOptions,
  });
};

const userResponse = (user) => ({ _id: user._id, name: user.name, email: user.email });

const registerUser = asyncHandler(async (req, res) => {
  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  const { password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with that email already exists');
  }
  const user = await User.create({ name, email, password });
  if (user) {
    setAuthCookie(res, user);
    res.status(201).json(userResponse(user));
  } else {
    res.status(400);
    throw new Error('Invalid user data received');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const { password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    setAuthCookie(res, user);
    res.status(200).json(userResponse(user));
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(userResponse(req.user));
});

const logoutUser = asyncHandler(async (req, res) => {
  req.user.tokenVersion += 1;
  await req.user.save();
  res.clearCookie(AUTH_COOKIE, {
    ...cookieOptions,
    maxAge: undefined,
  });
  res.status(204).send();
});

module.exports = { registerUser, loginUser, getMe, logoutUser };