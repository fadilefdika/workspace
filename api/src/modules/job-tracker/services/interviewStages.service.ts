import prisma from '../lib/prisma-client';
import { AppError } from '../../../shared/middlewares/errorHandler';
import { StageOutcome } from '@prisma/client';

export interface CreateInterviewStageInput {
  stageName: string;
  scheduledAt?: string | Date | null;
}

export interface UpdateInterviewStageInput {
  stageName?: string;
  scheduledAt?: string | Date | null;
  feedback?: string;
  outcome?: StageOutcome;
}

export class InterviewStagesService {
  static async getByApplicationId(applicationId: string) {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app || app.deletedAt) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    const stages = await prisma.interviewStage.findMany({
      where: { applicationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    return stages;
  }

  static async create(applicationId: string, data: CreateInterviewStageInput) {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app || app.deletedAt) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    const stage = await prisma.interviewStage.create({
      data: {
        applicationId,
        stageName: data.stageName,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        outcome: StageOutcome.PENDING,
      },
    });

    return stage;
  }

  static async update(applicationId: string, stageId: string, data: UpdateInterviewStageInput) {
    const stage = await prisma.interviewStage.findFirst({
      where: { id: stageId, applicationId, deletedAt: null },
    });

    if (!stage) {
      throw new AppError('Interview stage not found', 404, 'NOT_FOUND');
    }

    const updateData: any = {};
    if (data.stageName) updateData.stageName = data.stageName;
    if (data.scheduledAt !== undefined) updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    if (data.feedback !== undefined) updateData.feedback = data.feedback;
    if (data.outcome) updateData.outcome = data.outcome;

    const updated = await prisma.interviewStage.update({
      where: { id: stageId },
      data: updateData,
    });

    return updated;
  }
}
