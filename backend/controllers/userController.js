import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all users (Admin only)
// @route   GET /api/users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json({ success: true, count: users.length, data: users });
});

// @desc    Get single user
// @route   GET /api/users/:id
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

// @desc    Update user
// @route   PUT /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, message: 'User removed' });
});
