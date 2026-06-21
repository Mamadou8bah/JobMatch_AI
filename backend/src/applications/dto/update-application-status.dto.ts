import { IsIn } from 'class-validator';

export class UpdateApplicationStatusDto {
  @IsIn(['pending', 'shortlisted', 'rejected', 'interview', 'hired'])
  status!: 'pending' | 'shortlisted' | 'rejected' | 'interview' | 'hired';
}