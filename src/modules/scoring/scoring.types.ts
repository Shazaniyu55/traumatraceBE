export type ChildhoodTier = 'gentle' | 'clear' | 'high';

export interface AssessmentInput {
  stressorIds: string[]; // Step 1 selected stressors
  copingAnswerIds: string[]; // Step 2 selected coping answer ids (one per question)
  childhoodAnswers: Record<string, boolean>; // Step 3: questionId -> true(Yes)/false(No)
}

export interface AssessmentRule {
  type: 'COPING' | 'STRESSOR';
  sourceId: string;
  answerId: string;
  addsPointsTo: string; // trace map id, or "none"
  points: number;
}

export interface ScoredPattern {
  traceMapId: string;
  rawScore: number; // before multiplier
  finalScore: number; // after childhood multiplier
}

export interface ScoringResult {
  childhoodScore: number; // 0-10, NEVER returned to client
  childhoodTier: ChildhoodTier;
  multiplier: number;
  tierLanguage: string;
  rankedPatterns: ScoredPattern[]; // full ranked list (internal)
  surfacedPatternIds: string[]; // top 1-3 that crossed threshold
}

export const MINIMUM_THRESHOLD = 2;
export const MAX_SURFACED = 3;

export const TIER_LANGUAGE: Record<ChildhoodTier, string> = {
  gentle:
    'These patterns may have softer roots — but they are still worth understanding.',
  clear:
    'Some of these patterns are commonly associated with early experiences where your own needs sometimes came second.',
  high:
    'Some of these patterns are commonly associated with early environments that asked a great deal of you before you were ready. None of it was your fault.',
};
