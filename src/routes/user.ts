import { Router } from 'express';
import { getAllUsers, getUserById } from '../controllers/userController';

const router = Router();

/**
 * User routes
 * GET /users - Get all users (admin only)
 * GET /users/:id - Get user by ID
 */

// Get all users (admin only)
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

export default router; 