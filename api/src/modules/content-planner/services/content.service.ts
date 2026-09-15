import { ContentItem, ContentStatus, Platform } from '@prisma/client-content-planner';
import prisma from '../lib/prisma-client';

export class ContentService {
  async getAllContent(filters?: { status?: string; platform?: string }) {
    const where: any = { deletedAt: null };
    
    if (filters?.status) where.status = filters.status as ContentStatus;
    if (filters?.platform) where.platform = filters.platform as Platform;

    return prisma.contentItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getContentById(id: string) {
    return prisma.contentItem.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async createContent(data: { title: string; description?: string; platform: Platform; targetDate?: string }) {
    return prisma.contentItem.create({
      data: {
        title: data.title,
        description: data.description,
        platform: data.platform,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
      },
    });
  }

  async updateContent(id: string, data: Partial<ContentItem>) {
    // Only allow updating certain fields to keep it safe
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.contentBody !== undefined) updateData.contentBody = data.contentBody;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.publishUrl !== undefined) updateData.publishUrl = data.publishUrl;
    if (data.targetDate !== undefined) {
      updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    }

    return prisma.contentItem.update({
      where: { id },
      data: updateData,
    });
  }

  async softDeleteContent(id: string) {
    return prisma.contentItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
