import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { getAdminAnalytics, getAdminRecentExpenses, getAdminPendingApprovals, getAdminAllExpenses } from '../controllers/adminController';

const router = express.Router();

const adminCheck: express.RequestHandler = (req, res, next) => {
  // @ts-ignore
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden: Admins only' });
    return;
  }
  next();
};
router.use(passport.authenticate('jwt', { session: false }));
router.use(adminCheck);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get global analytics for all users
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Analytics data
 *       403:
 *         description: Forbidden
 */
router.get('/analytics', getAdminAnalytics);

/**
 * @swagger
 * /admin/recent-expenses:
 *   get:
 *     summary: Get recent expenses from all users
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of recent expenses to return
 *     responses:
 *       200:
 *         description: List of recent expenses
 *       403:
 *         description: Forbidden
 */
router.get('/recent-expenses', getAdminRecentExpenses);

/**
 * @swagger
 * /admin/pending-approvals:
 *   get:
 *     summary: Get all expenses pending approval
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of pending approval expenses
 *       403:
 *         description: Forbidden
 */
router.get('/pending-approvals', getAdminPendingApprovals);

/**
 * @swagger
 * /admin/all-expenses:
 *   get:
 *     summary: Get all expenses (admin)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all expenses
 *       403:
 *         description: Forbidden
 */
router.get('/all-expenses', getAdminAllExpenses);

export default router; 