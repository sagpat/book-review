import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { logger } from '../utils/logger';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type, title, message, data } = req.body;

      await this.notificationService.sendNotification({
        userId,
        type,
        title,
        message,
        data,
      });

      res.status(200).json({
        success: true,
        message: 'Notification sent successfully',
      });
    } catch (error) {
      logger.error('Error sending notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send notification',
      });
    }
  }

  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const notifications = await this.notificationService.getUserNotifications(userId, page, limit);

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get notifications',
      });
    }
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
        return;
      }

      const count = await this.notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        count: count,
      });
    } catch (error) {
      logger.error('Error getting unread notification count:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get unread count',
      });
    }
  }
}