import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationsService } from './applications.service';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Apply for a job' })
  @ApiOkResponse({ description: 'Application created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async apply(
    @Req() request: Request & { user: { sub: string; role: UserRole } },
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.createApplication(
      request.user.sub,
      request.user.role,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'List my applications' })
  @ApiOkResponse({ description: 'List of applications retrieved successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async myApplications(@Req() request: Request & { user: { sub: string } }) {
    return this.applicationsService.listMyApplications(request.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Employer, UserRole.Admin)
  @Get('job/:jobId')
  @ApiOperation({ summary: 'List applications for a job' })
  @ApiOkResponse({
    description: 'List of job applications retrieved successfully',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async jobApplications(
    @Req() request: Request & { user: { sub: string; role: UserRole } },
    @Param('jobId') jobId: string,
  ) {
    return this.applicationsService.listJobApplications(
      jobId,
      request.user.sub,
      request.user.role,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Employer, UserRole.Admin)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update application status' })
  @ApiOkResponse({ description: 'Application status updated successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async updateStatus(
    @Req() request: Request & { user: { sub: string; role: UserRole } },
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateApplicationStatus(
      id,
      request.user.sub,
      request.user.role,
      dto,
    );
  }
}
