import { Request, Response } from 'express';
import User from '../models/User';

/**
 * Get all users (admin only)
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 