import { Request, Response, NextFunction } from 'express';
import { ApplicationsService } from '../services/applications.service';

export class ApplicationsController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, companyId, source, sort } = req.query;
      const applications = await ApplicationsService.getAll({
        status: status as any,
        companyId: companyId as string,
        source: source as any,
        sort: sort as string,
      });
      return res.status(200).json(applications);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const application = await ApplicationsService.getById(id);
      return res.status(200).json(application);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await ApplicationsService.create(req.body);
      return res.status(201).json(application);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const application = await ApplicationsService.update(id, req.body);
      return res.status(200).json(application);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ApplicationsService.delete(id);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async generateFollowUpDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const draft = await ApplicationsService.generateFollowUpDraft(id);
      return res.status(200).json(draft);
    } catch (err) {
      next(err);
    }
  }
}
