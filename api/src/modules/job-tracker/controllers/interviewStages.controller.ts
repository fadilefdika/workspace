import { Request, Response, NextFunction } from 'express';
import { InterviewStagesService } from '../services/interviewStages.service';

export class InterviewStagesController {
  static async getByApplicationId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stages = await InterviewStagesService.getByApplicationId(id);
      return res.status(200).json(stages);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stage = await InterviewStagesService.create(id, req.body);
      return res.status(201).json(stage);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, stageId } = req.params;
      const stage = await InterviewStagesService.update(id, stageId, req.body);
      return res.status(200).json(stage);
    } catch (err) {
      next(err);
    }
  }
}
