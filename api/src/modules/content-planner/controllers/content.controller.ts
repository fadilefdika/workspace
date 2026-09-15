import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ContentService } from '../services/content.service';

const contentService = new ContentService();

export class ContentController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, platform } = req.query;
      const data = await contentService.getAllContent({
        status: status as string,
        platform: platform as string,
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await contentService.getContentById(id);
      if (!data) {
        return res.status(404).json({ error: { message: 'Content item not found', code: 'NOT_FOUND' } });
      }
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        platform: z.enum(['LINKEDIN', 'THREADS']),
        targetDate: z.string().optional(),
      });

      const validatedData = schema.parse(req.body);
      const data = await contentService.createContent(validatedData);
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const schema = z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        contentBody: z.string().optional(),
        status: z.enum(['IDEA', 'DRAFTING', 'REVIEW', 'SCHEDULED', 'PUBLISHED']).optional(),
        platform: z.enum(['LINKEDIN', 'THREADS']).optional(),
        publishUrl: z.string().optional(),
        targetDate: z.string().optional().nullable(),
      });

      const validatedData = schema.parse(req.body);
      const data = await contentService.updateContent(id, validatedData);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await contentService.softDeleteContent(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
