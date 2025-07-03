import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Category from '../models/Category';
import User from '../models/User';

// GET /admin/analytics
export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    // Total spent (all users)
    const totalSpent = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    // Total users
    const userCount = await User.countDocuments();
    // Top categories (by total spent)
    const topCategories = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { _id: 0, category: '$category.name', total: 1, count: 1 } }
    ]);
    // Spending trend (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrend = await Expense.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json({
      totalSpent: totalSpent[0]?.total || 0,
      userCount,
      topCategories,
      monthlyTrend
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /admin/recent-expenses
export const getAdminRecentExpenses = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const expenses = await Expense.find({})
      .populate('user', 'name email')
      .populate('category', 'name color icon')
      .sort({ date: -1 })
      .limit(limit)
      .lean();
    res.json(expenses);
  } catch (error) {
    console.error('Admin recent expenses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /admin/pending-approvals
export const getAdminPendingApprovals = async (req: Request, res: Response) => {
  try {
    const expenses = await Expense.find({ 'approval.status': 'requested' })
      .populate('user', 'name email')
      .populate('category', 'name color icon')
      .sort({ date: -1 })
      .lean();
    res.json(expenses);
  } catch (error) {
    console.error('Admin pending approvals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 