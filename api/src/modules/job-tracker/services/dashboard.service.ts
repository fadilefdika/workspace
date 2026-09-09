import prisma from '../lib/prisma-client';
import { ApplicationStatus } from '@prisma/client';

export class DashboardService {
  static async getSummary() {
    const totalApplied = await prisma.application.count();

    const inProgress = await prisma.application.count({
      where: {
        status: {
          in: [
            ApplicationStatus.APPLIED,
            ApplicationStatus.SCREENING,
            ApplicationStatus.INTERVIEW_HR,
            ApplicationStatus.INTERVIEW_USER,
          ],
        },
      },
    });

    const offers = await prisma.application.count({
      where: {
        status: {
          in: [ApplicationStatus.OFFER, ApplicationStatus.ACCEPTED],
        },
      },
    });

    const rejected = await prisma.application.count({
      where: {
        status: {
          in: [ApplicationStatus.REJECTED, ApplicationStatus.GHOSTED],
        },
      },
    });

    const respondedCount = await prisma.application.count({
      where: {
        status: {
          notIn: [ApplicationStatus.APPLIED],
        },
      },
    });

    const responseRate = totalApplied > 0 ? Math.round((respondedCount / totalApplied) * 100) : 0;

    return {
      totalApplied,
      inProgress,
      offers,
      rejected,
      responseRate,
    };
  }

  static async getFunnel() {
    const applied = await prisma.application.count({ where: { status: ApplicationStatus.APPLIED } });
    const screening = await prisma.application.count({ where: { status: ApplicationStatus.SCREENING } });
    const interview = await prisma.application.count({
      where: {
        status: { in: [ApplicationStatus.INTERVIEW_HR, ApplicationStatus.INTERVIEW_USER] },
      },
    });
    const offer = await prisma.application.count({ where: { status: ApplicationStatus.OFFER } });
    const accepted = await prisma.application.count({ where: { status: ApplicationStatus.ACCEPTED } });

    return {
      applied,
      screening,
      interview,
      offer,
      accepted,
    };
  }

  static async getMonthly() {
    const applications = await prisma.application.findMany({
      select: {
        appliedDate: true,
      },
      orderBy: {
        appliedDate: 'asc',
      },
    });

    const monthCounts: Record<string, number> = {};

    applications.forEach((app: any) => {
      const date = new Date(app.appliedDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    });

    const result = Object.entries(monthCounts).map(([month, count]) => ({
      month,
      count,
    }));

    return result;
  }

  static async getFollowUps() {
    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    const applications = await prisma.application.findMany({
      where: {
        nextFollowUp: {
          not: null,
          lte: next7Days,
        },
        status: {
          notIn: [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED, ApplicationStatus.GHOSTED],
        },
      },
      include: {
        company: true,
      },
      orderBy: {
        nextFollowUp: 'asc',
      },
    });

    return applications;
  }
}
