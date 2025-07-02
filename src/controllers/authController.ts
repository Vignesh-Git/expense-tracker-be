import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';

/**
 * Handle user login with email and password
 * @param req - Express request object
 * @param res - Express response object
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || '', 
      { expiresIn: '1d' }
    );

    // Return success response
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Handle user logout
 * @param req - Express request object
 * @param res - Express response object
 */
export const logout = (req: Request, res: Response): void => {
  try {
    // In a stateless JWT setup, logout is handled client-side
    // by removing the token from storage
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Handle user signup with email, password, and name
 * @param req - Express request object
 * @param res - Express response object
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      res.status(400).json({ message: 'Email, password, and name are required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Please provide a valid email address' });
      return;
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role: 'user' // Default role for new users
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role }, 
      process.env.JWT_SECRET || '', 
      { expiresIn: '1d' }
    );

    // Return success response
    res.status(201).json({ 
      message: 'User created successfully',
      token, 
      user: { 
        id: newUser._id, 
        email: newUser.email, 
        name: newUser.name, 
        role: newUser.role 
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Validate JWT token and return user information
 * @param req - Express request object
 * @param res - Express response object
 */
export const validateToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    const user = await User.findById(userId, '-password');
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 