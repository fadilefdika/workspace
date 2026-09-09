import { Request, Response, NextFunction } from 'express';
import { CompaniesService } from '../services/companies.service';

export class CompaniesController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { industry, location, priority, page, limit } = req.query;

      const pageNum = parseInt((page as string) || '1', 10);
      const limitNum = parseInt((limit as string) || '20', 10);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ error: { message: 'Invalid page parameter', code: 'INVALID_PARAM' } });
      }
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({ error: { message: 'limit must be between 1 and 100', code: 'INVALID_PARAM' } });
      }

      const result = await CompaniesService.getAll({
        industry: industry as string,
        location: location as string,
        priority: priority as any,
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

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const company = await CompaniesService.getBySlug(slug);
      return res.status(200).json(company);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await CompaniesService.create(req.body);
      return res.status(201).json(company);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const company = await CompaniesService.update(slug, req.body);
      return res.status(200).json(company);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      await CompaniesService.delete(slug);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const applications = await CompaniesService.getApplicationsByCompanySlug(slug);
      return res.status(200).json(applications);
    } catch (err) {
      next(err);
    }
  }
}
