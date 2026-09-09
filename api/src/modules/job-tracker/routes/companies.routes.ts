import { Router } from 'express';
import { z } from 'zod';
import { CompaniesController } from '../controllers/companies.controller';
import { validate } from '../../../shared/middlewares/validate';

const router = Router();

const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    industry: z.string().optional(),
    location: z.string().optional(),
    websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    careerPageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
    researchNotes: z.string().optional(),
    dealBreakers: z.array(z.string()).optional(),
  }),
});

const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    industry: z.string().optional(),
    location: z.string().optional(),
    websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    careerPageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
    researchNotes: z.string().optional(),
    dealBreakers: z.array(z.string()).optional(),
  }),
});

router.get('/', CompaniesController.getAll);
router.post('/', validate(createCompanySchema), CompaniesController.create);
router.get('/:slug', CompaniesController.getBySlug);
router.patch('/:slug', validate(updateCompanySchema), CompaniesController.update);
router.delete('/:slug', CompaniesController.delete);
router.get('/:slug/applications', CompaniesController.getApplications);

export default router;
