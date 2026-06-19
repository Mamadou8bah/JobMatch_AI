import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiConnectionService } from './ai-connection.service';

@Controller('ai')
export class AiConnectionController {
  constructor(private readonly aiConnectionService: AiConnectionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('resume-parse')
  async parseResume(@Body() body: { text?: string; skills?: string[]; education?: string[]; experience?: string[] }) {
    return this.aiConnectionService.parseResume(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('match-score/:jobId')
  async matchScore(@Req() request: Request & { user: { sub: string } }, @Param('jobId') jobId: string) {
    return this.aiConnectionService.getCandidateMatch(request.user.sub, jobId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('skills-gap')
  async skillsGap(@Body() body: { candidateSkills?: string[]; requiredSkills?: string[] }) {
    return this.aiConnectionService.skillsGap(body.candidateSkills ?? [], body.requiredSkills ?? []);
  }

  @UseGuards(JwtAuthGuard)
  @Post('training-recommendations')
  async recommendations(@Body() body: { missingSkills?: string[] }) {
    return this.aiConnectionService.recommendTraining(body.missingSkills ?? []);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(@Req() request: Request & { user: { sub: string } }, @Body() body: { message: string }) {
    return this.aiConnectionService.chat({ message: body.message, userId: request.user.sub });
  }

  @UseGuards(JwtAuthGuard)
  @Post('learning-roadmap')
  async learningRoadmap(
    @Req() request: Request & { user: { sub: string } },
    @Body() body: { goal: string; currentSkills?: string[] },
  ) {
    return this.aiConnectionService.learningRoadmap({
      goal: body.goal,
      currentSkills: body.currentSkills,
      userId: request.user.sub,
    });
  }
}
