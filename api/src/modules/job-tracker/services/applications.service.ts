import prisma from '../lib/prisma-client';
import { AppError } from '../../../shared/middlewares/errorHandler';
import { ApplicationSource, ApplicationStatus } from '@prisma/client';

export interface CreateApplicationInput {
  companyId: string;
  position: string;
  appliedDate: string | Date;
  source: ApplicationSource;
  applicationLink?: string;
  status?: ApplicationStatus;
  contactPerson?: string;
  contactInfo?: string;
  nextFollowUp?: string | Date | null;
  notes?: string;
  salaryRange?: string;
  attachmentUrl?: string;
  archivedJobDescription?: string;
  fitScore?: number;
  fitNotes?: string;
}

export interface UpdateApplicationInput {
  companyId?: string;
  position?: string;
  appliedDate?: string | Date;
  source?: ApplicationSource;
  applicationLink?: string;
  status?: ApplicationStatus;
  contactPerson?: string;
  contactInfo?: string;
  nextFollowUp?: string | Date | null;
  followUpCount?: number;
  notes?: string;
  salaryRange?: string;
  attachmentUrl?: string;
  archivedJobDescription?: string;
  fitScore?: number;
  fitNotes?: string;
}

export class ApplicationsService {
  static async getAll(query: {
    status?: ApplicationStatus;
    companyId?: string;
    source?: ApplicationSource;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.status) {
      where.status = query.status;
    }
    if (query.companyId) {
      where.companyId = query.companyId;
    }
    if (query.source) {
      where.source = query.source;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'applied_asc') orderBy = { appliedDate: 'asc' };
    if (query.sort === 'applied_desc') orderBy = { appliedDate: 'desc' };
    if (query.sort === 'status') orderBy = { status: 'asc' };

    const [applications, total] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        include: {
          company: true,
          interviewStages: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return { data: applications, total, page, limit };
  }

  static async getById(id: string) {
    const application = await prisma.application.findUnique({
      where: { id, deletedAt: null },
      include: {
        company: true,
        interviewStages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!application || application.deletedAt) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    return application;
  }

  static async create(data: CreateApplicationInput) {
    const companyExists = await prisma.company.findUnique({ where: { id: data.companyId } });
    if (!companyExists) {
      throw new AppError('Company not found', 404, 'NOT_FOUND');
    }

    const application = await prisma.application.create({
      data: {
        companyId: data.companyId,
        position: data.position,
        appliedDate: new Date(data.appliedDate),
        source: data.source,
        applicationLink: data.applicationLink,
        status: data.status || ApplicationStatus.APPLIED,
        statusUpdatedAt: new Date(),
        contactPerson: data.contactPerson,
        contactInfo: data.contactInfo,
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp) : null,
        notes: data.notes,
        salaryRange: data.salaryRange,
        attachmentUrl: data.attachmentUrl,
        archivedJobDescription: data.archivedJobDescription || (data.applicationLink ? `Link Lowongan: ${data.applicationLink}` : undefined),
        fitScore: data.fitScore !== undefined ? data.fitScore : null,
        fitNotes: data.fitNotes,
      },
      include: {
        company: true,
        interviewStages: true,
      },
    });

    return application;
  }

  static async update(id: string, data: UpdateApplicationInput) {
    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    const updateData: any = {};
    if (data.companyId) updateData.companyId = data.companyId;
    if (data.position) updateData.position = data.position;
    if (data.appliedDate) updateData.appliedDate = new Date(data.appliedDate);
    if (data.source) updateData.source = data.source;
    if (data.applicationLink !== undefined) updateData.applicationLink = data.applicationLink;
    if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson;
    if (data.contactInfo !== undefined) updateData.contactInfo = data.contactInfo;
    if (data.nextFollowUp !== undefined) updateData.nextFollowUp = data.nextFollowUp ? new Date(data.nextFollowUp) : null;
    if (data.followUpCount !== undefined) updateData.followUpCount = data.followUpCount;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.salaryRange !== undefined) updateData.salaryRange = data.salaryRange;
    if (data.attachmentUrl !== undefined) updateData.attachmentUrl = data.attachmentUrl;
    if (data.archivedJobDescription !== undefined) updateData.archivedJobDescription = data.archivedJobDescription;
    if (data.fitScore !== undefined) updateData.fitScore = data.fitScore;
    if (data.fitNotes !== undefined) updateData.fitNotes = data.fitNotes;

    if (data.status && data.status !== existing.status) {
      updateData.status = data.status;
      updateData.statusUpdatedAt = new Date();
    }

    const updated = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        interviewStages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return updated;
  }

  static async delete(id: string) {
    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    await prisma.application.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  static async generateFollowUpDraft(id: string) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!app || app.deletedAt) {
      throw new AppError('Application not found', 404, 'NOT_FOUND');
    }

    if (app.followUpCount >= 2) {
      throw new AppError('Follow-up limit reached (max 2 times per application)', 400, 'FOLLOW_UP_LIMIT_REACHED');
    }

    const dateFormatted = new Date(app.appliedDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const contactName = app.contactPerson || 'Tim Rekrutmen / HR';

    const draftText = `Yth. Bapak/Ibu ${contactName} dari ${app.company.name},

Saya berharap Bapak/Ibu dalam keadaan sehat.

Menindaklanjuti lamaran pekerjaan yang telah saya ajukan pada tanggal ${dateFormatted} untuk posisi ${app.position}, melalui email ini saya ingin menyampaikan ketertarikan saya yang sangat besar untuk bergabung dengan ${app.company.name}.

Apabila ada informasi tambahan atau dokumen pendukung lain yang diperlukan dalam proses penyeleksian, saya akan dengan senang hati menyediakannya.

Terima kasih atas waktu dan perhatian Bapak/Ibu. Saya sangat berharap dapat melangkah ke tahap seleksi berikutnya.

Hormat saya,
[Nama Anda]
[Nomor Telepon]
[LinkedIn / Portfolio Link]`;

    return { draftText, followUpCount: app.followUpCount };
  }
}
