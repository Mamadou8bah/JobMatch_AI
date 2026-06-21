import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateJobDto } from './dto/create-job.dto';
import { JobQueryDto } from './dto/job-query.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async list(@Req() request: Request & { user?: { sub: string } }, @Query() query: JobQueryDto) {
    return this.jobsService.listJobs(request.user?.sub, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Employer, UserRole.Admin)
  @Post()
  async create(@Req() request: Request & { user: { sub: string; role: UserRole } }, @Body() dto: CreateJobDto) {
    return this.jobsService.createJob(request.user.sub, request.user.role, dto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Employer, UserRole.Admin)
  @Patch(':id')
  async update(@Req() request: Request & { user: { sub: string; role: UserRole } }, @Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.updateJob(id, request.user.sub, request.user.role, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Employer, UserRole.Admin)
  @Delete(':id')
  async delete(@Req() request: Request & { user: { sub: string; role: UserRole } }, @Param('id') id: string) {
    return this.jobsService.deleteJob(id, request.user.sub, request.user.role);
  }

  @Get(':id/matches')
  async matches(@Param('id') id: string) {
    return this.jobsService.getJobMatches(id);
  }
}