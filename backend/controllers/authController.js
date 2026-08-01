import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const mapRole = (role) => {
  switch (role) {
    case 'owner':
      return 'car_owner';
    case 'provider':
      return 'parking_provider';
    case 'valet':
      return 'valet_driver';
    case 'admin':
      return 'admin';
    default:
      return 'car_owner';
  }
};

const normalizeClientRole = (role) => {
  switch (role) {
    case 'car_owner':
      return 'owner';
    case 'parking_provider':
      return 'provider';
    case 'valet_driver':
      return 'valet';
    default:
      return role;
  }
};

const normalizeUserForClient = (user) => {
  const normalized = user.toObject ? user.toObject() : { ...user };
  normalized.role = normalizeClientRole(normalized.role);
  delete normalized.password;
  return normalized;
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Please provide fullName, email, password, and role' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
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

    return res.status(201).json({ success: true, token, user: userData });
  } catch (error) {
    console.error('Registration failed:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    const userData = normalizeUserForClient(user);

    return res.json({ success: true, token, user: userData });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
  const userData = req.user.toObject ? req.user.toObject() : { ...req.user };
  delete userData.password;
  return res.json({ success: true, user: userData });
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented' });
};
