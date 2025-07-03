import { Request, Response } from 'express';
import Category from '../models/Category';

/**
 * Get all categories for the authenticated user
 * @param req - Express request object
 * @param res - Express response object
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user._id;

    const categories = await Category.find({ user: userId, isActive: true })
      .sort({ name: 1 })
      .lean();

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a single category by ID
 * @param req - Express request object
 * @param res - Express response object
 */
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user._id;
    const { id } = req.params;

    const category = await Category.findOne({ _id: id, user: userId }).lean();

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new category
 * @param req - Express request object
 * @param res - Express response object
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user._id;
    const { name, color, icon } = req.body;

    // Validate required fields
    if (!name || !color) {
      res.status(400).json({ message: 'Name and color are required' });
      return;
    }

    // Check if category name already exists for this user
    const existingCategory = await Category.findOne({ user: userId, name });
    if (existingCategory) {
      res.status(400).json({ message: 'Category name already exists' });
      return;
    }

    // Create category
    const category = new Category({
      user: userId,
      name,
      color,
      icon: icon || 'pi pi-tag',
      isActive: true
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update an existing category
 * @param req - Express request object
 * @param res - Express response object
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user._id;
    const { id } = req.params;
    const updateData = req.body;

    // Check if category exists and belongs to user
    const existingCategory = await Category.findOne({ _id: id, user: userId });
    if (!existingCategory) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Check if name is being updated and if it conflicts with existing category
    if (updateData.name && updateData.name !== existingCategory.name) {
      const nameConflict = await Category.findOne({ 
        user: userId, 
        name: updateData.name,
        _id: { $ne: id }
      });
      if (nameConflict) {
        res.status(400).json({ message: 'Category name already exists' });
        return;
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a category
 * @param req - Express request object
 * @param res - Express response object
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user._id;
    const { id } = req.params;

    const category = await Category.findOne({ _id: id, user: userId });
    
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Soft delete by setting isActive to false
    await Category.findByIdAndUpdate(id, { isActive: false });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create default categories for a new user
 * @param req - Express request object
 * @param res - Express response object
 */
export const createDefaultCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    // @ts-ignore - user is added by passport middleware
    const userId = req.user._id;

    const defaultCategories = [
      { name: 'Food & Dining', color: '#FF6B6B', icon: 'pi pi-utensils' },
      { name: 'Transportation', color: '#4ECDC4', icon: 'pi pi-car' },
      { name: 'Shopping', color: '#45B7D1', icon: 'pi pi-shopping-bag' },
      { name: 'Entertainment', color: '#96CEB4', icon: 'pi pi-gamepad' },
      { name: 'Bills & Utilities', color: '#FFEAA7', icon: 'pi pi-bolt' },
      { name: 'Healthcare', color: '#DDA0DD', icon: 'pi pi-heart' },
      { name: 'Education', color: '#98D8C8', icon: 'pi pi-book' },
      { name: 'Travel', color: '#F7DC6F', icon: 'pi pi-globe' }
    ];

    // Create default categories
    const categories = defaultCategories.map(cat => ({
      user: userId,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      isActive: true
    }));

    await Category.insertMany(categories);

    res.status(201).json({
      message: 'Default categories created successfully',
      categories
    });
  } catch (error) {
    console.error('Create default categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 