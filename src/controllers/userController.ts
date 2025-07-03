import { Request, Response } from 'express';
import User from '../models/User';
import mongoose from 'mongoose';
import { Db, GridFSBucket } from 'mongodb';

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

// Helper to get GridFSBucket
const getGridFSBucket = () => {
  return new GridFSBucket(mongoose.connection.db as Db, { bucketName: 'profileImages' });
};

/**
 * Upload user profile image (authenticated user)
 * Expects a single file in req.file
 */
export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user._id;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Remove old image if exists
    const user = await User.findById(userId);
    if (user?.profileImageId) {
      const bucket = getGridFSBucket();
      await bucket.delete(user.profileImageId);
    }
    // Save new image
    const fileId = (req.file as any).id;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.profileImageId = fileId;
    await user.save();
    res.json({ message: 'Profile image uploaded', fileId });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user profile image by user id
 */
export const getProfileImage = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.profileImageId) {
      return res.status(404).json({ message: 'Profile image not found' });
    }
    const bucket = getGridFSBucket();
    const fileId = user.profileImageId;
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'Profile image not found' });
    }
    res.set('Content-Type', files[0].contentType || 'image/jpeg');
    bucket.openDownloadStream(fileId).pipe(res);
  } catch (error) {
    console.error('Get profile image error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 