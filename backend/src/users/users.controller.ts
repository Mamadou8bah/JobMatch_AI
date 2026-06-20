import { Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() request: Request & { user: { sub: string } }) {
    return this.usersService.getUserById(request.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() request: Request & { user: { sub: string } }, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(request.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/skills')
  async updateSkills(@Req() request: Request & { user: { sub: string } }, @Body() body: { skills: string[] }) {
    return this.usersService.updateSkills(request.user.sub, body.skills);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/cv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @Req() request: Request & { user: { sub: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadCv(request.user.sub, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Get()
  async list(@Req() request: Request & { user: { role: UserRole } }) {
    this.usersService.assertAdmin(request.user.role);
    return this.usersService.listUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Get(':id')
  async getById(@Req() request: Request & { user: { role: UserRole } }, @Param('id') id: string) {
    this.usersService.assertAdmin(request.user.role);
    return this.usersService.getUserById(id);
  }
}
