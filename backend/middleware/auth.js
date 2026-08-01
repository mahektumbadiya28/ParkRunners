import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Normalize DB role to client role
const normalizeClientRole = (role) => {
  switch (role) {
    case 'car_owner': return 'owner';
    case 'space_provider': return 'provider';
    case 'valet_driver': return 'valet';
    default: return role;
  }
};

export const normalizeUserForClient = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  obj.role = normalizeClientRole(obj.role);
  delete obj.password;
  return obj;
};

// Authenticate JWT token
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = normalizeUserForClient(user);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Role-based access control
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Role '${req.user.role}' is not allowed.`
    });
  }
  next();
};
