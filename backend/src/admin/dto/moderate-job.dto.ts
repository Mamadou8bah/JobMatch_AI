import { IsIn, IsOptional, IsString } from 'class-validator';

export class ModerateJobDto {
  @IsIn(['published', 'rejected', 'pending_review', 'closed'])
  status!: 'published' | 'rejected' | 'pending_review' | 'closed';

  @IsOptional()
  @IsString()
  reason?: string;
}
