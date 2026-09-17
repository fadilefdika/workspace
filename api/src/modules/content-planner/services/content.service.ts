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

  async createContent(data: { title: string; description?: string; contentBody?: string; themeTag?: string; platform: Platform; targetDate?: string }) {
    return prisma.contentItem.create({
      data: {
        title: data.title,
        description: data.description,
        contentBody: data.contentBody,
        themeTag: data.themeTag,
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
    if (data.themeTag !== undefined) updateData.themeTag = data.themeTag;
    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.publishUrl !== undefined) updateData.publishUrl = data.publishUrl;
    if (data.metricsReach !== undefined) updateData.metricsReach = data.metricsReach;
    if (data.metricsLikes !== undefined) updateData.metricsLikes = data.metricsLikes;
    if (data.metricsComments !== undefined) updateData.metricsComments = data.metricsComments;
    if (data.metricsShares !== undefined) updateData.metricsShares = data.metricsShares;
    
    if (data.targetDate !== undefined) {
      updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    }
    if (data.publishedDate !== undefined) {
      updateData.publishedDate = data.publishedDate ? new Date(data.publishedDate) : null;
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

  async getDashboardStats() {
    const allContents = await prisma.contentItem.findMany({
      where: { deletedAt: null },
    });

    const statsByStatus = {
      IDEA: 0,
      DRAFT: 0,
      READY: 0,
      PUBLISHED: 0,
    };

    let totalReach = 0;
    let totalLikes = 0;

    allContents.forEach((c) => {
      if (c.status in statsByStatus) {
        statsByStatus[c.status as keyof typeof statsByStatus]++;
      }
      if (c.status === 'PUBLISHED') {
        totalReach += c.metricsReach || 0;
        totalLikes += c.metricsLikes || 0;
      }
    });

    // Calculate weekly streak (how many consecutive weeks with at least 1 published content starting from current week)
    const publishedContents = allContents.filter(c => c.status === 'PUBLISHED' && c.publishedDate).sort((a, b) => b.publishedDate!.getTime() - a.publishedDate!.getTime());
    let weeklyStreak = 0;
    
    if (publishedContents.length > 0) {
      const msInWeek = 7 * 24 * 60 * 60 * 1000;
      const now = new Date();
      // align to week start (Sunday)
      const currentWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      
      let expectedWeekStart = currentWeekStart.getTime();
      let lastCheckedWeek = -1;
      let hasCurrentWeek = false;

      for (const content of publishedContents) {
        const pubDate = content.publishedDate!;
        const contentWeekStart = new Date(pubDate.getFullYear(), pubDate.getMonth(), pubDate.getDate() - pubDate.getDay()).getTime();
        
        if (contentWeekStart === expectedWeekStart) {
          if (lastCheckedWeek !== contentWeekStart) {
            weeklyStreak++;
            lastCheckedWeek = contentWeekStart;
            expectedWeekStart -= msInWeek;
            if (contentWeekStart === currentWeekStart.getTime()) {
              hasCurrentWeek = true;
            }
          }
        } else if (contentWeekStart === currentWeekStart.getTime() - msInWeek && weeklyStreak === 0 && !hasCurrentWeek) {
          // If haven't published this week, but published last week, streak continues from last week
          weeklyStreak++;
          lastCheckedWeek = contentWeekStart;
          expectedWeekStart = contentWeekStart - msInWeek;
        } else if (contentWeekStart < expectedWeekStart) {
          break; // streak broken
        }
      }
    }

    return {
      statusStats: statsByStatus,
      weeklyStreak,
      totalReach,
      totalLikes,
      completionRate: allContents.length > 0 ? Math.round((statsByStatus.PUBLISHED / allContents.length) * 100) : 0,
    };
  }
}
