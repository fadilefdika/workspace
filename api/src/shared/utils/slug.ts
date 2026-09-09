import { PrismaClient } from '@prisma/client';

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function generateSlug(name: string, prisma: PrismaClient, currentCompanyId?: string): Promise<string> {
  const baseSlug = slugify(name) || 'company';
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existing = await prisma.company.findUnique({
      where: { slug },
    });

    if (!existing || (currentCompanyId && existing.id === currentCompanyId)) {
      return slug;
    }

    count++;
    slug = `${baseSlug}-${count}`;
  }
}
