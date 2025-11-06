import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { logger } from '../utils/logger';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  async getPopularBooks(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const timeframe = req.query.timeframe as string || 'month';

      const popularBooks = await this.analyticsService.getPopularBooks(limit, timeframe);

      res.status(200).json({
        success: true,
        data: popularBooks,
      });
    } catch (error) {
      logger.error('Error getting popular books:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get popular books analytics',
      });
    }
  }

  async getUserActivity(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const activityData = await this.analyticsService.getUserActivityStats(
        startDate as string,
        endDate as string
      );

      res.status(200).json({
        success: true,
        data: activityData,
      });
    } catch (error) {
      logger.error('Error getting user activity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user activity analytics',
      });
    }
  }

  async getReviewStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.analyticsService.getReviewStatistics();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error getting review stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get review statistics',
      });
    }
  }
}