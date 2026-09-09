import { Request, Response, NextFunction } from 'express';
import { ApplicationsService } from '../services/applications.service';

export class ApplicationsController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, companyId, source, sort, page, limit } = req.query;

      const pageNum = parseInt((page as string) || '1', 10);
      const limitNum = parseInt((limit as string) || '20', 10);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ error: { message: 'Invalid page parameter', code: 'INVALID_PARAM' } });
      }
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({ error: { message: 'limit must be between 1 and 100', code: 'INVALID_PARAM' } });
      }

      const result = await ApplicationsService.getAll({
        status: status as any,
        companyId: companyId as string,
        source: source as any,
        sort: sort as string,
        page: pageNum,
        limit: limitNum,
      });

      const totalPages = Math.ceil(result.total / result.limit);
      res.setHeader('X-Total-Count', result.total);
      res.setHeader('X-Total-Pages', totalPages);
      return res.status(200).json(result.data);
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
