import {
  IsArray,
  IsBoolean,
  IsObject,
  IsString,
} from 'class-validator';

export class SubmitAssessmentDto {
  // Step 1
  @IsArray()
  @IsString({ each: true })
  stressorIds: string[];

  // Step 2 — selected coping answer ids (one per coping question)
  @IsArray()
  @IsString({ each: true })
  copingAnswerIds: string[];

  // Step 3 — childhood questionId -> true (Yes) / false (No)
  @IsObject()
  childhoodAnswers: Record<string, boolean>;
}
