import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateTrainingCourseDto } from './dto/create-training-course.dto';
import { UpdateTrainingCourseDto } from './dto/update-training-course.dto';
import { TrainingService } from './training.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  list(@Query('skill') skill?: string) {
    return this.trainingService.listCourses(skill);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations/:jobId')
  personalized(
    @Req() request: Request & { user: { sub: string } },
    @Param('jobId') jobId: string,
  ) {
    return this.trainingService.getPersonalizedRecommendations(request.user.sub, jobId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TrainingProvider, UserRole.Admin)
  @Get('mine')
  listMine(@Req() request: Request & { user: { sub: string; role: UserRole } }) {
    if (request.user.role === UserRole.Admin) {
      return this.trainingService.listCourses(undefined, true);
    }
    return this.trainingService.listOwnedCourses(request.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TrainingProvider, UserRole.Admin)
  @Post('mine')
  createMine(
    @Req() request: Request & { user: { sub: string; role: UserRole } },
    @Body() dto: CreateTrainingCourseDto,
  ) {
    if (request.user.role === UserRole.Admin) {
      return this.trainingService.createCourse(dto, request.user.sub, Boolean(dto.featured));
    }
    return this.trainingService.createProviderCourse(request.user.sub, request.user.role, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TrainingProvider, UserRole.Admin)
  @Patch('mine/:id')
  updateMine(
    @Req() request: Request & { user: { sub: string; role: UserRole } },
    @Param('id') id: string,
    @Body() dto: UpdateTrainingCourseDto,
  ) {
    return this.trainingService.updateOwnedCourse(id, request.user.sub, request.user.role, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TrainingProvider, UserRole.Admin)
  @Delete('mine/:id')
  deleteMine(
    @Req() request: Request & { user: { sub: string; role: UserRole } },
    @Param('id') id: string,
  ) {
    return this.trainingService.deleteOwnedCourse(id, request.user.sub, request.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Get('admin')
  listForAdmin(@Query('skill') skill?: string) {
    return this.trainingService.listCourses(skill, true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Post()
  create(@Body() dto: CreateTrainingCourseDto) {
    return this.trainingService.createCourse(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTrainingCourseDto) {
    return this.trainingService.updateCourse(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.trainingService.deleteCourse(id);
  }
}
