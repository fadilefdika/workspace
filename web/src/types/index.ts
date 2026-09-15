export type Priority ='HIGH'|'MEDIUM'|'LOW';

export type ApplicationSource =
 |'LINKEDIN'
 |'JOBSTREET'
 |'GLINTS'
 |'COMPANY_WEBSITE'
 |'REFERRAL'
 |'CAREER_FAIR'
 |'OTHER';

export type ApplicationStatus =
 |'APPLIED'
 |'SCREENING'
 |'INTERVIEW_HR'
 |'INTERVIEW_USER'
 |'OFFER'
 |'ACCEPTED'
 |'REJECTED'
 |'GHOSTED';

export type StageOutcome ='PENDING'|'PASSED'|'FAILED';

export interface Company {
 id: string;
 name: string;
 slug: string;
 industry?: string | null;
 location?: string | null;
 websiteUrl?: string | null;
 careerPageUrl?: string | null;
 priority: Priority;
 researchNotes?: string | null;
 dealBreakers: string[];
 applicationCount?: number;
 applications?: Application[];
 createdAt: string;
 updatedAt: string;
}

export interface InterviewStage {
 id: string;
 applicationId: string;
 stageName: string;
 scheduledAt?: string | null;
 feedback?: string | null;
 outcome: StageOutcome;
 createdAt: string;
}

export interface Application {
 id: string;
 companyId: string;
 company?: Company;
 position: string;
 appliedDate: string;
 source: ApplicationSource;
 applicationLink?: string | null;
 status: ApplicationStatus;
 statusUpdatedAt: string;
 contactPerson?: string | null;
 contactInfo?: string | null;
 nextFollowUp?: string | null;
 followUpCount: number;
 notes?: string | null;
 salaryRange?: string | null;
 attachmentUrl?: string | null;
 archivedJobDescription?: string | null;
 fitScore?: number | null;
 fitNotes?: string | null;
 interviewStages?: InterviewStage[];
 createdAt: string;
 updatedAt: string;
}

export interface DashboardSummary {
 totalApplied: number;
 inProgress: number;
 offers: number;
 rejected: number;
 responseRate: number;
}

export interface DashboardFunnel {
 applied: number;
 screening: number;
 interview: number;
 offer: number;
 accepted: number;
}

export interface DashboardMonthly {
 month: string;
 count: number;
}


// Content Planner Types
export type ContentStatus = 'IDEA' | 'DRAFTING' | 'REVIEW' | 'SCHEDULED' | 'PUBLISHED';
export type Platform = 'LINKEDIN' | 'THREADS';

export interface ContentItem {
  id: string;
  title: string;
  description?: string | null;
  contentBody?: string | null;
  status: ContentStatus;
  platform: Platform;
  targetDate?: string | null;
  publishUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}
