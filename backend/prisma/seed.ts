import { PrismaClient, UserRole, JobStatus, TrainingCourseStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@jobmatch.ai';
  const passwordHash = await bcrypt.hash('Admin12345!', 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      fullName: 'System Admin',
      approved: true,
      emailVerified: true,
      skills: [],
    },
  });

  await prisma.trainingCourse.createMany({
    data: [
      {
        title: 'Intro to CV Writing',
        provider: 'JobMatch Academy',
        description: 'Learn how to write a strong CV.',
        skills: ['communication'],
        status: TrainingCourseStatus.ACTIVE,
      },
      {
        title: 'SQL Basics',
        provider: 'JobMatch Academy',
        description: 'Understand database queries and relational data.',
        skills: ['database', 'sql'],
        status: TrainingCourseStatus.ACTIVE,
      },
    ],
    skipDuplicates: true,
  });

  const employer = await prisma.user.findUnique({ where: { email: 'employer@jobmatch.ai' } });
  if (employer) {
    await prisma.job.createMany({
      data: [
        {
          employerId: employer.id,
          title: 'Frontend Developer',
          description: 'Build web interfaces for the platform.',
          location: 'Banjul',
          employmentType: 'full-time',
          experienceLevel: 'mid',
          requiredSkills: ['typescript', 'react', 'communication'],
          status: JobStatus.PUBLISHED,
        },
      ],
      skipDuplicates: true,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });