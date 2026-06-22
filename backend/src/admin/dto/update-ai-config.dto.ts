import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateAiConfigDto {
  @IsOptional()
  @IsString()
  aiEngineUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  aiMatchThreshold?: number;

  @IsOptional()
  @IsBoolean()
  aiEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  careerChatEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  resumeParsingEnabled?: boolean;
}
