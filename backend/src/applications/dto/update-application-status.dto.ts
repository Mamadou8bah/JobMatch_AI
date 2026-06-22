import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsIn(['pending', 'shortlisted', 'rejected', 'interview', 'hired'])
  status!: 'pending' | 'shortlisted' | 'rejected' | 'interview' | 'hired';

  @IsOptional()
  @IsString()
  interviewMessage?: string;
}