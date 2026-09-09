import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/summary', DashboardController.getSummary);
router.get('/funnel', DashboardController.getFunnel);
router.get('/monthly', DashboardController.getMonthly);
router.get('/follow-ups', DashboardController.getFollowUps);

export default router;
