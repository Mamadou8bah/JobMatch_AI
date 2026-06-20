import { ArrayMinSize, IsArray, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateJobDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  location!: string;

  @IsString()
  employmentType!: string;

  @IsString()
  experienceLevel!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  requiredSkills!: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsIn(['draft', 'published', 'closed'])
  status?: 'draft' | 'published' | 'closed';
}