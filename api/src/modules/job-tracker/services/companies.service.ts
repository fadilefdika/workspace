import prisma from '../lib/prisma-client';
import { generateSlug } from '../../../shared/utils/slug';
import { AppError } from '../../../shared/middlewares/errorHandler';
import { Priority } from '@prisma/client';

export interface CreateCompanyInput {
  name: string;
  industry?: string;
  location?: string;
  websiteUrl?: string;
  careerPageUrl?: string;
  priority?: Priority;
  researchNotes?: string;
  dealBreakers?: string[];
}

export interface UpdateCompanyInput {
  name?: string;
  industry?: string;
  location?: string;
  websiteUrl?: string;
  careerPageUrl?: string;
  priority?: Priority;
  researchNotes?: string;
  dealBreakers?: string[];
}

export class CompaniesService {
  static async getAll(query: { industry?: string; location?: string; priority?: Priority }) {
    const where: any = { deletedAt: null };
    if (query.industry) {
      where.industry = { contains: query.industry, mode: 'insensitive' };
    }
    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }
    if (query.priority) {
      where.priority = query.priority;
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return companies.map((c: any) => ({
      ...c,
      applicationCount: c._count.applications,
    }));
  }

  static async getBySlug(slug: string) {
    const company = await prisma.company.findUnique({
      where: { slug },
      include: {
        applications: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          include: {
            interviewStages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!company || company.deletedAt) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }

    return {
      ...company,
      applicationCount: company._count.applications,
    };
  }

  static async create(data: CreateCompanyInput) {
    const slug = await generateSlug(data.name, prisma);

    const company = await prisma.company.create({
      data: {
        name: data.name,
        slug,
        industry: data.industry,
        location: data.location,
        websiteUrl: data.websiteUrl,
        careerPageUrl: data.careerPageUrl,
        priority: data.priority || Priority.MEDIUM,
        researchNotes: data.researchNotes,
        dealBreakers: data.dealBreakers || [],
      },
    });

    return company;
  }

  static async update(slug: string, data: UpdateCompanyInput) {
    const existing = await prisma.company.findUnique({ where: { slug } });
    if (!existing || existing.deletedAt) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }

    let newSlug = existing.slug;
    if (data.name && data.name !== existing.name) {
      newSlug = await generateSlug(data.name, prisma, existing.id);
    }

    const updated = await prisma.company.update({
      where: { slug },
      data: {
        name: data.name,
        slug: newSlug,
        industry: data.industry,
        location: data.location,
        websiteUrl: data.websiteUrl,
        careerPageUrl: data.careerPageUrl,
        priority: data.priority,
        researchNotes: data.researchNotes,
        dealBreakers: data.dealBreakers,
      },
    });

    return updated;
  }

  static async delete(slug: string) {
    const existing = await prisma.company.findUnique({ where: { slug } });
    if (!existing || existing.deletedAt) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }

    await prisma.company.update({ where: { slug }, data: { deletedAt: new Date() } });
  }

  static async getApplicationsByCompanySlug(slug: string) {
    const company = await prisma.company.findUnique({ where: { slug } });
    if (!company || company.deletedAt) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }

    const applications = await prisma.application.findMany({
      where: { companyId: company.id, deletedAt: null },
      include: {
        company: true,
        interviewStages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return applications;
  }
}
