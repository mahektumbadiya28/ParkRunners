import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { normalizeUserForClient, protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';

describe('Auth Middleware Unit Tests', () => {
  describe('normalizeUserForClient', () => {
    it('should map car_owner to owner and remove password', () => {
      const mockUser = {
        _id: '123',
        role: 'car_owner',
        password: 'hashedpassword',
        toObject: () => ({ _id: '123', role: 'car_owner', password: 'hashedpassword' })
      };
      
      const normalized = normalizeUserForClient(mockUser);
      expect(normalized.role).toBe('owner');
      expect(normalized.password).toBeUndefined();
      expect(normalized._id).toBe('123');
    });

    it('should map space_provider to provider', () => {
      const mockUser = { role: 'space_provider' };
      const normalized = normalizeUserForClient(mockUser);
      expect(normalized.role).toBe('provider');
    });
  });

  describe('authorize Middleware', () => {
    it('should grant access if role is allowed', () => {
      const req = { user: { role: 'admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const middleware = authorize('admin', 'manager');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access (403) if role is not allowed', () => {
      const req = { user: { role: 'valet' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      const middleware = authorize('admin', 'owner');
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('Access denied')
      }));
    });
  });
});
