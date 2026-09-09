import { Request, Response, NextFunction } from 'express';
import { CompaniesService } from '../services/companies.service';

export class CompaniesController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { industry, location, priority } = req.query;
      const companies = await CompaniesService.getAll({
        industry: industry as string,
        location: location as string,
        priority: priority as any,
      });
      return res.status(200).json(companies);
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
