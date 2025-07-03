import express from 'express';
import passport from 'passport';
import {
  getNotifications,
  createNotification,
  addReply,
  updateStatus,
  getAllNotifications
} from '../controllers/notificationController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(passport.authenticate('jwt', { session: false }));

// Get notifications for the authenticated user
router.get('/', getNotifications);

// Create a new notification
router.post('/', createNotification);

// Add a reply to a notification
router.post('/:id/reply', addReply);

// Update notification status (admin only)
router.put('/:id/status', updateStatus);

// Get all notifications (admin only)
router.get('/admin', getAllNotifications);

export default router; 