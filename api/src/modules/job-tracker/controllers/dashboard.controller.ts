import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await DashboardService.getSummary();
      return res.status(200).json(summary);
    } catch (err) {
      next(err);
    }
  }

  static async getFunnel(req: Request, res: Response, next: NextFunction) {
    try {
      const funnel = await DashboardService.getFunnel();
      return res.status(200).json(funnel);
    } catch (err) {
      next(err);
    }
  }

  static async getMonthly(req: Request, res: Response, next: NextFunction) {
    try {
      const monthly = await DashboardService.getMonthly();
      return res.status(200).json(monthly);
    } catch (err) {
      next(err);
    }
  }

  static async getFollowUps(req: Request, res: Response, next: NextFunction) {
    try {
      const followUps = await DashboardService.getFollowUps();
      return res.status(200).json(followUps);
    } catch (err) {
      next(err);
    }
  }
}
