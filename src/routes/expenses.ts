import express from 'express';
import passport from 'passport';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseAnalytics
} from '../controllers/expenseController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(passport.authenticate('jwt', { session: false }));

// GET /expenses - Get all expenses with filtering and pagination
router.get('/', getExpenses);

// GET /expenses/:id - Get a single expense by ID
router.get('/:id', getExpenseById);

// POST /expenses - Create a new expense
router.post('/', createExpense);

// PUT /expenses/:id - Update an existing expense
router.put('/:id', updateExpense);

// DELETE /expenses/:id - Delete an expense
router.delete('/:id', deleteExpense);

// GET /expenses/analytics - Get expense analytics and statistics
router.get('/analytics', getExpenseAnalytics);

export default router; 