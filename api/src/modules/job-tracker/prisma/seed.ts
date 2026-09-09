import { PrismaClient, Priority } from '@prisma/client';
import { slugify } from '../../../shared/utils/slug';

const prisma = new PrismaClient();

const initialCompanies = [
  { name: 'Chint Indonesia', industry: 'Electrical & Automation', location: 'Jakarta, Indonesia', priority: Priority.HIGH, websiteUrl: 'https://chintglobal.com', careerPageUrl: 'https://chintglobal.com/career' },
  { name: 'Chin Nurinda Electric', industry: 'Electrical Equipment', location: 'Jakarta, Indonesia', priority: Priority.MEDIUM, websiteUrl: 'https://nurinda.co.id', careerPageUrl: 'https://nurinda.co.id/career/' },
  { name: 'Sinergi Giat Perkasa', industry: 'Engineering & Construction', location: 'Jakarta, Indonesia', priority: Priority.MEDIUM, websiteUrl: 'https://gspe.co.id', careerPageUrl: null },
  { name: 'NR Electric Jakarta', industry: 'Power Systems & Automation', location: 'Jakarta, Indonesia', priority: Priority.HIGH, websiteUrl: 'https://nrec.com', careerPageUrl: 'https://nrec.com/en/join-us/' },
  { name: 'YPIT', industry: 'Information Technology', location: 'Jakarta, Indonesia', priority: Priority.MEDIUM, websiteUrl: null, careerPageUrl: null },
  { name: 'YPTT', industry: 'Telecommunications', location: 'Jakarta, Indonesia', priority: Priority.MEDIUM, websiteUrl: null, careerPageUrl: null },
  { name: 'Huawei', industry: 'Telecommunications & ICT', location: 'Jakarta, Indonesia', priority: Priority.HIGH, websiteUrl: 'https://www.huawei.com', careerPageUrl: 'https://career.huawei.com' },
  { name: 'Indonesia Morowali Industrial Park (IMIP)', industry: 'Industrial Park & Metallurgy', location: 'Morowali, Sulawesi Tengah', priority: Priority.HIGH, websiteUrl: 'https://imip.co.id', careerPageUrl: 'https://rekrutmen.imip.co.id/' },
  { name: 'CGS International', industry: 'Financial Services & Securities', location: 'Jakarta, Indonesia', priority: Priority.MEDIUM, websiteUrl: 'https://www.cgsi.co.id', careerPageUrl: 'https://www.cgsi.co.id/careers' },
];

async function main() {
  console.log('Seeding initial companies...');
  for (const company of initialCompanies) {
    const baseSlug = slugify(company.name);
    let slug = baseSlug;
    let count = 1;

    while (await prisma.company.findUnique({ where: { slug } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }

    await prisma.company.upsert({
      where: { slug },
      update: {},
      create: {
        name: company.name,
        slug,
        industry: company.industry,
        location: company.location,
        priority: company.priority,
        websiteUrl: company.websiteUrl,
        careerPageUrl: company.careerPageUrl,
        researchNotes: `Target company: ${company.name}`,
        dealBreakers: [],
      },
    });
  }
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
