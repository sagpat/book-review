import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';

const router = Router();
const analyticsController = new AnalyticsController();

/**
 * @swagger
 * /api/analytics/books/popular:
 *   get:
 *     summary: Get popular books analytics
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 */
router.get('/books/popular', analyticsController.getPopularBooks.bind(analyticsController));

/**
 * @swagger
 * /api/analytics/users/activity:
 *   get:
 *     summary: Get user activity analytics
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 */
router.get('/users/activity', analyticsController.getUserActivity.bind(analyticsController));

/**
 * @swagger
 * /api/analytics/reviews/stats:
 *   get:
 *     summary: Get review statistics
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 */
router.get('/reviews/stats', analyticsController.getReviewStats.bind(analyticsController));

export default router;