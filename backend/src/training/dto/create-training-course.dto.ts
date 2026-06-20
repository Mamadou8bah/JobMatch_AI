import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateTrainingCourseDto {
  @IsString()
  title!: string;

  @IsString()
  provider!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  url?: string;

  @IsArray()
  @IsString({ each: true })
  skills!: string[];
}
