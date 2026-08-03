import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';

const mapRole = (role) => {
  switch (role) {
    case 'owner': return 'car_owner';
    case 'provider': return 'parking_provider';
    case 'valet': return 'valet_driver';
    case 'admin': return 'admin';
    default: return 'car_owner';
  }
};

const normalizeClientRole = (role) => {
  switch (role) {
    case 'car_owner': return 'owner';
    case 'parking_provider': return 'provider';
    case 'valet_driver': return 'valet';
    default: return role;
  }
};

const normalizeUserForClient = (user) => {
  const normalized = user.toObject ? user.toObject() : { ...user };
  normalized.role = normalizeClientRole(normalized.role);
  normalized.name = normalized.fullName || normalized.name;
  delete normalized.password;
  return normalized;
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    res.status(400);
    throw new Error('Please provide fullName, email, password, and role');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error('Email is already registered');
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role: mapRole(role),
    phone: '',
  });

  const token = generateToken(user._id);
  const userData = normalizeUserForClient(user);

  res.status(201).json({ success: true, token, user: userData });
});

// @desc    Login user
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id);
  const userData = normalizeUserForClient(user);

  res.json({ success: true, token, user: userData });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getProfile = asyncHandler(async (req, res) => {
  const userData = req.user.toObject ? req.user.toObject() : { ...req.user };
  delete userData.password;
  res.json({ success: true, user: userData });
});

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  res.status(501);
  throw new Error('Not implemented');
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  res.status(501);
  throw new Error('Not implemented');
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
export const verifyOtp = asyncHandler(async (req, res) => {
  res.status(501);
  throw new Error('Not implemented');
});

// @desc    Switch user role
// @route   PUT /api/auth/role
export const switchRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role) {
    res.status(400);
    throw new Error('Role is required');
  }

  const normalized = mapRole(role);
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.role = normalized;
  await user.save();

  const token = generateToken(user._id);
  const userData = normalizeUserForClient(user);

  res.json({ success: true, token, user: userData });
});
