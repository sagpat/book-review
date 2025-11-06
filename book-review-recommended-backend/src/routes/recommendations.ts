import { Router } from 'express';
import { RecommendationController } from '../controllers/RecommendationController';

const router = Router();
const recommendationController = new RecommendationController();

/**
 * @swagger
 * /api/recommendations/user/{userId}:
 *   get:
 *     summary: Get book recommendations for a user
 *     description: Returns personalized book recommendations based on user's reading history and preferences
 *     tags:
 *       - Recommendations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of recommendations to return (default 10)
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/user/:userId', recommendationController.getUserRecommendations.bind(recommendationController));

/**
 * @swagger
 * /api/recommendations/similar/{bookId}:
 *   get:
 *     summary: Get similar books
 *     description: Returns books similar to the specified book
 *     tags:
 *       - Recommendations
 *     security:
 *       - bearerAuth: []
 */
router.get('/similar/:bookId', recommendationController.getSimilarBooks.bind(recommendationController));

/**
 * @swagger
 * /api/recommendations/trending:
 *   get:
 *     summary: Get trending books
 *     description: Returns currently trending books based on reviews and ratings
 *     tags:
 *       - Recommendations
 *     security:
 *       - bearerAuth: []
 */
router.get('/trending', recommendationController.getTrendingBooks.bind(recommendationController));

export default router;