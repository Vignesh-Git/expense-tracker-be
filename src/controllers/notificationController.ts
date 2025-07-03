import { Request, Response } from 'express';
import Notification, { INotification } from '../models/Notification';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser & { _id: string; role: 'user' | 'admin' };
}

/**
 * @swagger
 * /notification:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser & { _id: string; role: 'user' | 'admin' };
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /notification:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [category, expense]
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser & { _id: string; role: 'user' | 'admin' };
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { type, message } = req.body;

    if (!type || !message) {
      res.status(400).json({ message: 'Type and message are required' });
      return;
    }

    if (!['category', 'expense'].includes(type)) {
      res.status(400).json({ message: 'Type must be category or expense' });
      return;
    }

    const notification = new Notification({
      user: user._id,
      type,
      messages: [{
        sender: 'user',
        message,
        timestamp: new Date()
      }]
    });

    await notification.save();
    await notification.populate('user', 'name email');

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /notification/{id}/reply:
 *   post:
 *     summary: Add a reply to a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
export const addReply = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser & { _id: string; role: 'user' | 'admin' };
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ message: 'Message is required' });
      return;
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    // Check if user owns the notification or is admin
    if (notification.user.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const sender = user.role === 'admin' ? 'admin' : 'user';
    
    notification.messages.push({
      sender,
      message,
      timestamp: new Date()
    });

    await notification.save();
    await notification.populate('user', 'name email');

    res.json(notification);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /notification/{id}/status:
 *   put:
 *     summary: Update notification status (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - message
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, denied]
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Notification not found
 */
export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser & { _id: string; role: 'user' | 'admin' };
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const { status, message } = req.body;

    if (!status || !message) {
      res.status(400).json({ message: 'Status and message are required' });
      return;
    }

    if (!['approved', 'denied'].includes(status)) {
      res.status(400).json({ message: 'Status must be approved or denied' });
      return;
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    notification.status = status;
    notification.messages.push({
      sender: 'admin',
      message,
      timestamp: new Date()
    });

    await notification.save();
    await notification.populate('user', 'name email');

    res.json(notification);
  } catch (error) {
    console.error('Error updating notification status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @swagger
 * /notification/admin:
 *   get:
 *     summary: Get all notifications (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
export const getAllNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser & { _id: string; role: 'user' | 'admin' };
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 