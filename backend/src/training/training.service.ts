import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TrainingCourseStatus } from '@prisma/client';
import { BILLING_FEATURES } from '../billing/billing.constants';
import { EntitlementsService } from '../billing/entitlements.service';
import { DatabaseService } from '../database/database.service';
import { JobsService } from '../jobs/jobs.service';
import { AiConnectionService } from '../ai-connection/ai-connection.service';
import { CreateTrainingCourseDto } from './dto/create-training-course.dto';
import { UpdateTrainingCourseDto } from './dto/update-training-course.dto';

@Injectable()
export class TrainingService {
  constructor(
    private readonly database: DatabaseService,
    private readonly jobsService: JobsService,
    private readonly aiConnectionService: AiConnectionService,
    private readonly entitlements: EntitlementsService,
  ) {}

  listCourses(skill?: string, includeInactive = false) {
    return this.database.trainingCourse.findMany({
      where: {
        ...(includeInactive ? {} : { status: TrainingCourseStatus.ACTIVE }),
        ...(skill ? { skills: { has: skill } } : {}),
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
  }

  listOwnedCourses(ownerId: string) {
    return this.database.trainingCourse.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createCourse(dto: CreateTrainingCourseDto, ownerId?: string, featured = false) {
    return this.database.trainingCourse.create({
      data: {
        title: dto.title,
        provider: dto.provider || 'JobMatch Academy',
        description: dto.description,
        url: dto.url,
        skills: dto.skills,
        ownerId: ownerId || null,
        featured,
      },
    });
  }

  async createProviderCourse(ownerId: string, role: string, dto: CreateTrainingCourseDto) {
    await this.entitlements.assertCanCreateCourse(ownerId, role);
    const premium = await this.entitlements.isPremium(ownerId);
    const owner = await this.database.user.findUnique({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException('Provider not found');
    if (role === 'training_provider' && !owner.approved) {
      throw new ForbiddenException('Your training provider account must be approved before listing courses');
    }

    return this.createCourse(
      {
        ...dto,
        provider: dto.provider || owner.companyName || owner.fullName,
      },
      ownerId,
      Boolean(premium && dto.featured),
    );
  }

  async updateOwnedCourse(courseId: string, ownerId: string, role: string, dto: UpdateTrainingCourseDto) {
    const course = await this.ensureCourseExists(courseId);
    if (role !== 'admin' && course.ownerId !== ownerId) {
      throw new ForbiddenException('You can only manage your own courses');
    }
    const premium = role === 'admin' ? true : await this.entitlements.isPremium(ownerId);
    return this.database.trainingCourse.update({
      where: { id: courseId },
      data: {
        title: dto.title,
        provider: dto.provider,
        description: dto.description,
        url: dto.url,
        skills: dto.skills,
        status: dto.status ? this.toCourseStatus(dto.status) : undefined,
        featured: premium ? (dto.featured ?? course.featured) : false,
      },
    });
  }

  async deleteOwnedCourse(courseId: string, ownerId: string, role: string) {
    const course = await this.ensureCourseExists(courseId);
    if (role !== 'admin' && course.ownerId !== ownerId) {
      throw new ForbiddenException('You can only manage your own courses');
    }
    await this.database.trainingCourse.delete({ where: { id: courseId } });
    return { message: 'Training course deleted successfully' };
  }

  async updateCourse(courseId: string, dto: UpdateTrainingCourseDto) {
    await this.ensureCourseExists(courseId);

    return this.database.trainingCourse.update({
      where: { id: courseId },
      data: {
        title: dto.title,
        provider: dto.provider,
        description: dto.description,
        url: dto.url,
        skills: dto.skills,
        status: dto.status ? this.toCourseStatus(dto.status) : undefined,
        featured: dto.featured,
      },
    });
  }

  async deleteCourse(courseId: string) {
    await this.ensureCourseExists(courseId);
    await this.database.trainingCourse.delete({ where: { id: courseId } });
    return { message: 'Training course deleted successfully' };
  }

  private async ensureCourseExists(courseId: string) {
    const course = await this.database.trainingCourse.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Training course not found');
    }
    return course;
  }

  private toCourseStatus(status: 'active' | 'inactive') {
    return status === 'active' ? TrainingCourseStatus.ACTIVE : TrainingCourseStatus.INACTIVE;
  }

  async getPersonalizedRecommendations(userId: string, jobId: string) {
    await this.entitlements.assertPremium(
      userId,
      BILLING_FEATURES.TRAINING_RECS,
      'Personalized course recommendations are a Premium feature.',
    );

    const user = await this.database.user.findUnique({
      where: { id: userId },
      select: { skills: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const job = await this.jobsService.getJobById(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const gap = await this.aiConnectionService.skillsGap(user.skills, job.requiredSkills);
    const missingSkills = gap.missingSkills;

    if (missingSkills.length === 0) {
      return {
        missingSkills: [],
        recommendations: [],
      };
    }

    const localCourses = await this.database.trainingCourse.findMany({
      where: {
        status: TrainingCourseStatus.ACTIVE,
        skills: {
          hasSome: missingSkills,
        },
      },
    });

    const aiResponse = await this.aiConnectionService.recommendTraining(missingSkills);
    const aiRecommendations = aiResponse.recommendations;

    const recommendations: Array<{
      title: string;
      provider: string;
      url: string;
      skill?: string;
      description?: string;
      type: 'local' | 'ai';
    }> = [];

    for (const course of localCourses) {
      const matchedSkill = course.skills.find((s) => missingSkills.includes(s));
      recommendations.push({
        title: course.title,
        provider: course.provider,
        url: course.url ?? '',
        skill: matchedSkill,
        description: course.description ?? undefined,
        type: 'local',
      });
    }

    const coveredSkills = new Set(recommendations.map((r) => r.skill).filter((s): s is string => !!s));

    for (const rec of aiRecommendations) {
      if (recommendations.length >= 5) {
        break;
      }
      if (rec.skill && !coveredSkills.has(rec.skill)) {
        recommendations.push({
          title: rec.title,
          provider: rec.provider ?? 'Online Course',
          url: rec.url ?? '',
          skill: rec.skill,
          description: rec.description,
          type: 'ai',
        });
        coveredSkills.add(rec.skill);
      }
    }

    for (const rec of aiRecommendations) {
      if (recommendations.length >= 5) {
        break;
      }
      if (!recommendations.some((r) => r.title === rec.title)) {
        recommendations.push({
          title: rec.title,
          provider: rec.provider ?? 'Online Course',
          url: rec.url ?? '',
          skill: rec.skill,
          description: rec.description,
          type: 'ai',
        });
      }
    }

    return {
      missingSkills,
      recommendations,
    };
  }
}
