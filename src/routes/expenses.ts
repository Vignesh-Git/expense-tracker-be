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

/**
 * @swagger
 * components:
 *   schemas:
 *     Approval:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [requested, approved, denied]
 *           description: Approval status for the expense
 *           example: requested
 *         description:
 *           type: string
 *           description: Admin's approval/denial reason or note
 *           example: ''
 *     Expense:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Expense ID
 *         user:
 *           type: string
 *           description: User ID
 *         category:
 *           type: string
 *           description: Category ID
 *         amount:
 *           type: number
 *           description: Expense amount
 *         description:
 *           type: string
 *           description: Expense description
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the expense
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, bank_transfer, digital_wallet, other]
 *           description: Payment method
 *         isRecurring:
 *           type: boolean
 *           description: Is the expense recurring?
 *         recurringFrequency:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           description: Recurring frequency
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs to uploaded files
 *         approval:
 *           $ref: '#/components/schemas/Approval'
 *           description: Approval status and description
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       201:
 *         description: Expense created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Expense'
 *   get:
 *     summary: Get all expenses with filtering and pagination
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expenses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *                 pagination:
 *                   type: object
 *                   description: Pagination info
 */
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