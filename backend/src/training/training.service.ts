import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingCourseStatus } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateTrainingCourseDto } from './dto/create-training-course.dto';
import { UpdateTrainingCourseDto } from './dto/update-training-course.dto';

@Injectable()
export class TrainingService {
  constructor(private readonly database: DatabaseService) {}

  listCourses(skill?: string, includeInactive = false) {
    return this.database.trainingCourse.findMany({
      where: {
        ...(includeInactive ? {} : { status: TrainingCourseStatus.ACTIVE }),
        ...(skill ? { skills: { has: skill } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createCourse(dto: CreateTrainingCourseDto) {
    return this.database.trainingCourse.create({
      data: {
        title: dto.title,
        provider: dto.provider,
        description: dto.description,
        url: dto.url,
        skills: dto.skills,
      },
    });
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
  }

  private toCourseStatus(status: 'active' | 'inactive') {
    return status === 'active' ? TrainingCourseStatus.ACTIVE : TrainingCourseStatus.INACTIVE;
  }
}
