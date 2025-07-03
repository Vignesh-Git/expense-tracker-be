import express from 'express';
import passport from 'passport';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  createDefaultCategories,
  toggleCategoryStatus
} from '../controllers/categoryController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(passport.authenticate('jwt', { session: false }));

// GET /categories - Get all categories
router.get('/', getCategories as any);

// GET /categories/default - Create default categories
router.get('/default', createDefaultCategories as any);

// GET /categories/:id - Get a single category
router.get('/:id', getCategoryById as any);

// POST /categories - Create a new category
router.post('/', createCategory as any);

// PUT /categories/:id - Update a category
router.put('/:id', updateCategory as any);

// DELETE /categories/:id - Delete a category
router.delete('/:id', deleteCategory as any);

// Toggle category status (admin only)
router.patch('/:id/status', toggleCategoryStatus as any);

export default router; 