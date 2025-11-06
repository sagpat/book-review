import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';

const router = Router();
const searchController = new SearchController();

/**
 * @swagger
 * /api/search/books:
 *   get:
 *     summary: Enhanced book search
 *     tags:
 *       - Search
 *     security:
 *       - bearerAuth: []
 */
router.get('/books', searchController.searchBooks.bind(searchController));

/**
 * @swagger
 * /api/search/advanced:
 *   post:
 *     summary: Advanced search with filters
 *     tags:
 *       - Search
 *     security:
 *       - bearerAuth: []
 */
router.post('/advanced', searchController.advancedSearch.bind(searchController));

export default router;