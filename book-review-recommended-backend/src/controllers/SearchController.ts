import { Request, Response } from 'express';
import { SearchService } from '../services/SearchService';
import { logger } from '../utils/logger';

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  async searchBooks(req: Request, res: Response): Promise<void> {
    try {
      const { q, page = 1, limit = 20, sortBy = 'relevance' } = req.query;

      if (!q) {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
        return;
      }

      const results = await this.searchService.searchBooks(
        q as string,
        parseInt(page as string),
        parseInt(limit as string),
        sortBy as string
      );

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      logger.error('Error searching books:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search books',
      });
    }
  }

  async advancedSearch(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.body;

      const results = await this.searchService.advancedSearch(filters);

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      logger.error('Error in advanced search:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform advanced search',
      });
    }
  }
}