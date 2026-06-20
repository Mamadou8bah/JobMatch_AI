import { ArrayMinSize, IsArray, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateJobDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	location?: string;

	@IsOptional()
	@IsString()
	employmentType?: string;

	@IsOptional()
	@IsString()
	experienceLevel?: string;

	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@IsString({ each: true })
	requiredSkills?: string[];

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