import { Request, Response } from 'express';
import Category from '../models/Category';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser & { _id: string; role: 'user' | 'admin' };
}

/**
 * Get all categories for the authenticated user
 * @param req - Express request object
 * @param res - Express response object
 */
export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    // Admins see all categories, users see only active ones
    const filter = user?.role === 'admin' ? {} : { isActive: true };
    
    const categories = await Category.find(filter).sort({ name: 1 }).lean();
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
export const getCategoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
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
export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { name, color, icon } = req.body;
    
    if (!name || !color) {
      res.status(400).json({ message: 'Name and color are required' });
      return;
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400).json({ message: 'Category name already exists' });
      return;
    }

    // Determine if category should be active based on user role
    const isActive = user?.role === 'admin';

    const category = new Category({
      name,
      color,
      icon: icon || 'pi pi-tag',
      isActive
    });
    
    await category.save();
    
    res.status(201).json({
      message: isActive ? 'Category created successfully' : 'Category request created successfully',
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
export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
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
export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
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
export const createDefaultCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

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

/**
 * Toggle category active status (admin only)
 * @param req - Express request object
 * @param res - Express response object
 */
export const toggleCategoryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden: Admins only' });
      return;
    }

    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({ message: 'isActive must be a boolean' });
      return;
    }

    const category = await Category.findById(id);
    
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    category.isActive = isActive;
    await category.save();

    res.json({
      message: `Category ${isActive ? 'activated' : 'deactivated'} successfully`,
      category
    });
  } catch (error) {
    console.error('Toggle category status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 