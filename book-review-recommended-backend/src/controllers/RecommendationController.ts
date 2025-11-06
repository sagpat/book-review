import { Request, Response } from 'express';
import { RecommendationService } from '../services/RecommendationService';
import { logger } from '../utils/logger';

export class RecommendationController {
  private recommendationService: RecommendationService;

  constructor() {
    this.recommendationService = new RecommendationService();
  }

  async getUserRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;

      const recommendations = await this.recommendationService.getPersonalizedRecommendations(userId, limit);

      res.status(200).json({
        success: true,
        data: {
          recommendations,
          count: recommendations.length,
        },
      });
    } catch (error) {
      logger.error('Error getting user recommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recommendations',
      });
    }
  }

  async getSimilarBooks(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      
      if (!bookId) {
        res.status(400).json({
          success: false,
          error: 'Book ID is required',
        });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;

      const similarBooks = await this.recommendationService.getSimilarBooks(bookId, limit);

      res.status(200).json({
        success: true,
        data: {
          similarBooks,
          count: similarBooks.length,
        },
      });
    } catch (error) {
      logger.error('Error getting similar books:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get similar books',
      });
    }
  }

  async getTrendingBooks(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const timeframe = req.query.timeframe as string || 'week';

      const trendingBooks = await this.recommendationService.getTrendingBooks(limit, timeframe);

      res.status(200).json({
        success: true,
        data: {
          trendingBooks,
          count: trendingBooks.length,
          timeframe,
        },
      });
    } catch (error) {
      logger.error('Error getting trending books:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get trending books',
      });
    }
  }
}