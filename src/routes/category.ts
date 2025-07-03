import express from 'express';
import passport from 'passport';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  createDefaultCategories
} from '../controllers/categoryController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(passport.authenticate('jwt', { session: false }));

// GET /categories - Get all categories for the user
router.get('/', getCategories);

// GET /categories/default - Create default categories for new user
router.get('/default', createDefaultCategories);

// GET /categories/:id - Get a single category by ID
router.get('/:id', getCategoryById);

// POST /categories - Create a new category
router.post('/', createCategory);

// PUT /categories/:id - Update an existing category
router.put('/:id', updateCategory);

// DELETE /categories/:id - Delete a category
router.delete('/:id', deleteCategory);

export default router; 