import { IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  jobId!: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;
}