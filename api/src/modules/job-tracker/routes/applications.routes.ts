import { Router } from 'express';
import { z } from 'zod';
import { ApplicationsController } from '../controllers/applications.controller';
import { InterviewStagesController } from '../controllers/interviewStages.controller';
import { validate } from '../../../shared/middlewares/validate';

const router = Router();

const createApplicationSchema = z.object({
  body: z.object({
    companyId: z.string().min(1, 'Company ID is required'),
    position: z.string().min(1, 'Position is required'),
    appliedDate: z.string().min(1, 'Applied date is required'),
    source: z.enum(['LINKEDIN', 'JOBSTREET', 'GLINTS', 'COMPANY_WEBSITE', 'REFERRAL', 'CAREER_FAIR', 'OTHER']),
    applicationLink: z.string().optional().or(z.literal('')),
    status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW_HR', 'INTERVIEW_USER', 'OFFER', 'ACCEPTED', 'REJECTED', 'GHOSTED']).optional(),
    contactPerson: z.string().optional(),
    contactInfo: z.string().optional(),
    nextFollowUp: z.string().nullable().optional(),
    notes: z.string().optional(),
    salaryRange: z.string().optional(),
    attachmentUrl: z.string().optional(),
    archivedJobDescription: z.string().optional(),
    fitScore: z.number().min(0).max(100).optional().nullable(),
    fitNotes: z.string().optional(),
  }),
});

const updateApplicationSchema = z.object({
  body: z.object({
    companyId: z.string().optional(),
    position: z.string().optional(),
    appliedDate: z.string().optional(),
    source: z.enum(['LINKEDIN', 'JOBSTREET', 'GLINTS', 'COMPANY_WEBSITE', 'REFERRAL', 'CAREER_FAIR', 'OTHER']).optional(),
    applicationLink: z.string().optional().or(z.literal('')),
    status: z.enum(['APPLIED', 'SCREENING', 'INTERVIEW_HR', 'INTERVIEW_USER', 'OFFER', 'ACCEPTED', 'REJECTED', 'GHOSTED']).optional(),
    contactPerson: z.string().optional(),
    contactInfo: z.string().optional(),
    nextFollowUp: z.string().nullable().optional(),
    followUpCount: z.number().optional(),
    notes: z.string().optional(),
    salaryRange: z.string().optional(),
    attachmentUrl: z.string().optional(),
    archivedJobDescription: z.string().optional(),
    fitScore: z.number().min(0).max(100).optional().nullable(),
    fitNotes: z.string().optional(),
  }),
});

const createStageSchema = z.object({
  body: z.object({
    stageName: z.string().min(1, 'Stage name is required'),
    scheduledAt: z.string().nullable().optional(),
  }),
});

const updateStageSchema = z.object({
  body: z.object({
    stageName: z.string().optional(),
    scheduledAt: z.string().nullable().optional(),
    feedback: z.string().optional(),
    outcome: z.enum(['PENDING', 'PASSED', 'FAILED']).optional(),
  }),
});

// Applications routes
router.get('/', ApplicationsController.getAll);
router.post('/', validate(createApplicationSchema), ApplicationsController.create);
router.get('/:id', ApplicationsController.getById);
router.patch('/:id', validate(updateApplicationSchema), ApplicationsController.update);
router.delete('/:id', ApplicationsController.delete);

// Follow-up draft route
router.post('/:id/follow-up-draft', ApplicationsController.generateFollowUpDraft);

// Interview stages routes (nested)
router.get('/:id/stages', InterviewStagesController.getByApplicationId);
router.post('/:id/stages', validate(createStageSchema), InterviewStagesController.create);
router.patch('/:id/stages/:stageId', validate(updateStageSchema), InterviewStagesController.update);

export default router;
