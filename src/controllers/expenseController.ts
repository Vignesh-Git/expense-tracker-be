import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Category from '../models/Category';
import Budget, { IBudget } from '../models/Budget';
import mongoose from 'mongoose';

/**
 * Get all expenses for the authenticated user with filtering and pagination
 * @param req - Express request object
 * @param res - Express response object
 */
export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      category, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount,
      paymentMethod,
      search,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = { user: userId };

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount as string);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount as string);
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const expenses = await Expense.find(filter)
      .populate('category', 'name color icon')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit as string))
      .lean();

    const total = await Expense.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit as string));
    const hasNextPage = parseInt(page as string) < totalPages;
    const hasPrevPage = parseInt(page as string) > 1;

    res.json({
      expenses,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages,
        totalItems: total,
        hasNextPage,
        hasPrevPage,
        itemsPerPage: parseInt(limit as string)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a single expense by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const getExpenseById = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user._id;
    const { id } = req.params;

    const expense = await Expense.findOne({ _id: id, user: userId })
      .populate('category', 'name color icon')
      .lean();

    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new expense
 * @param req - Express request object
 * @param res - Express response object
 */
export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user._id;
    const { 
      category, 
      amount, 
      description, 
      date, 
      paymentMethod, 
      location, 
      tags, 
      isRecurring, 
      recurringFrequency 
    } = req.body;

    // Validate required fields
    if (!category || !amount || !description) {
      res.status(400).json({ message: 'Category, amount, and description are required' });
      return;
    }

    // Validate amount
    if (amount <= 0) {
      res.status(400).json({ message: 'Amount must be greater than 0' });
      return;
    }

    // Check if category exists and belongs to user
    const categoryExists = await Category.findOne({ _id: category, user: userId });
    if (!categoryExists) {
      res.status(400).json({ message: 'Invalid category' });
      return;
    }

    // Create expense
    const expense = new Expense({
      user: userId,
      category,
      amount,
      description,
      date: date || new Date(),
      paymentMethod: paymentMethod || 'cash',
      location,
      tags,
      isRecurring: isRecurring || false,
      recurringFrequency
    });

    await expense.save();

    // Update budget spent amount if applicable
    const activeBudget = await Budget.findOne({
      user: userId,
      category: category,
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (activeBudget) {
      const totalSpent = await Expense.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            category: new mongoose.Types.ObjectId(category),
            date: { $gte: activeBudget.startDate, $lte: activeBudget.endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const spentAmount = totalSpent.length > 0 ? totalSpent[0].total : 0;
      await (activeBudget as IBudget).updateSpent(spentAmount);
    }

    // Populate category info for response
    await expense.populate('category', 'name color icon');

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update an existing expense
 * @param req - Express request object
 * @param res - Express response object
 */
export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user._id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if expense exists and belongs to user
    const existingExpense = await Expense.findOne({ _id: id, user: userId });
    if (!existingExpense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    // Validate amount if provided
    if (updateData.amount && updateData.amount <= 0) {
      res.status(400).json({ message: 'Amount must be greater than 0' });
      return;
    }

    // Check if category exists and belongs to user (if category is being updated)
    if (updateData.category) {
      const categoryExists = await Category.findOne({ _id: updateData.category, user: userId });
      if (!categoryExists) {
        res.status(400).json({ message: 'Invalid category' });
        return;
      }
    }

    // Update expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name color icon');

    res.json({
      message: 'Expense updated successfully',
      expense: updatedExpense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete an expense
 * @param req - Express request object
 * @param res - Express response object
 */
export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user._id;
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, user: userId });
    
    if (!expense) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get expense analytics and statistics
 * @param req - Express request object
 * @param res - Express response object
 */
export const getExpenseAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user._id;
    const { startDate, endDate, period = 'monthly' } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Total spending
    const totalSpending = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Spending by category
    const spendingByCategory = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $group: {
          _id: '$category',
          categoryName: { $first: '$categoryInfo.name' },
          categoryColor: { $first: '$categoryInfo.color' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Spending by payment method
    const spendingByPaymentMethod = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Monthly spending trend
    const monthlyTrend = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Average daily spending
    const avgDailySpending = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          dailyTotal: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$dailyTotal' }
        }
      }
    ]);

    res.json({
      period: { start, end },
      summary: {
        totalSpending: totalSpending[0]?.total || 0,
        totalExpenses: totalSpending[0]?.count || 0,
        averageDailySpending: avgDailySpending[0]?.average || 0
      },
      byCategory: spendingByCategory,
      byPaymentMethod: spendingByPaymentMethod,
      monthlyTrend: monthlyTrend.map(item => ({
        period: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        total: item.total,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Get expense analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 