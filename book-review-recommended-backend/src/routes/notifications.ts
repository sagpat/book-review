import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();
const notificationController = new NotificationController();

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send notification
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 */
router.post('/send', notificationController.sendNotification.bind(notificationController));

/**
 * @swagger
 * /api/notifications/user/{userId}:
 *   get:
 *     summary: Get user notifications
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 */
router.get('/user/:userId', notificationController.getUserNotifications.bind(notificationController));

/**
 * @swagger
 * /api/notifications/user/{userId}/unread-count:
 *   get:
 *     summary: Get unread notification count for user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 */
router.get('/user/:userId/unread-count', notificationController.getUnreadCount.bind(notificationController));

export default router;