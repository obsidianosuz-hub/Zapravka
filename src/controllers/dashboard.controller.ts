import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  
  /**
   * GET /api/dashboard/stats?period=daily|weekly|monthly|yearly
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const period = (req.query.period as string) || 'daily';
      
      if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
        res.status(400).json({ error: "Invalid period. Use 'daily', 'weekly', 'monthly', or 'yearly'" });
        return;
      }

      const stats = await DashboardService.getStats(period as 'daily' | 'weekly' | 'monthly' | 'yearly');
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * GET /api/dashboard/live
   */
  static async getLiveStatus(req: Request, res: Response): Promise<void> {
    try {
      const liveData = await DashboardService.getLiveStatus();
      res.status(200).json(liveData);
    } catch (error) {
      console.error('Error fetching live status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
