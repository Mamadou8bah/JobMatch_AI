import { IsOptional, IsString } from 'class-validator';

export class CreateChatThreadDto {
  @IsString()
  participantId!: string;

  @IsOptional()
  @IsString()
  jobId?: string;
}
