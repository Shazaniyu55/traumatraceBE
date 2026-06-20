import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  AssessmentInput,
  AssessmentRule,
  ChildhoodTier,
  MAX_SURFACED,
  MINIMUM_THRESHOLD,
  ScoredPattern,
  ScoringResult,
  TIER_LANGUAGE,
} from './scoring.types';

/**
 * TraumaTrace Scoring Engine.
 *
 * A TRANSPARENT WEIGHTED-TAG SYSTEM — not AI, fully explainable.
 * It surfaces the 1-3 trace maps that best match the user's answers.
 *
 *  - NEVER returns a numeric score to the client (childhoodScore stays internal).
 *  - NEVER produces a "diagnosis" or "trauma type".
 *  - The childhood module is grounded in the VACS African-adversity framework.
 *
 * Rules are loaded from assessment_rules.csv (the source of truth). Swap that
 * file to retune weights without touching this code.
 */
@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);
  private rules: AssessmentRule[] = [];

  constructor() {
    this.loadRules();
  }
private loadRules(): void {
  const csvPath = path.join(
    process.cwd(),
    'src',
    'modules',
    'seed',
    'data',
    'assessment_rules.csv',
  );
  const raw = fs.readFileSync(csvPath, 'utf-8').trim();
  const [header, ...lines] = raw.split('\n');
  const cols = header.split(',').map((c) => c.trim());
  this.rules = lines.map((line) => {
    const v = line.split(',');
    const get = (name: string) => v[cols.indexOf(name)]?.trim() ?? '';
    return {
      type: get('type') as 'COPING' | 'STRESSOR',
      sourceId: get('source_id'),
      answerId: get('answer_id'),
      addsPointsTo: get('adds_points_to'),
      points: Number(get('points')) || 0,
    };
  });
  this.logger.log(`Loaded ${this.rules.length} assessment rules`);
}
  // private loadRules(): void {
  //   const csvPath = path.join(__dirname, '..', 'seed', 'data', 'assessment_rules.csv');
  //   const raw = fs.readFileSync(csvPath, 'utf-8').trim();
  //   const [header, ...lines] = raw.split('\n');
  //   const cols = header.split(',').map((c) => c.trim());
  //   this.rules = lines.map((line) => {
  //     const v = line.split(',');
  //     const get = (name: string) => v[cols.indexOf(name)]?.trim() ?? '';
  //     return {
  //       type: get('type') as 'COPING' | 'STRESSOR',
  //       sourceId: get('source_id'),
  //       answerId: get('answer_id'),
  //       addsPointsTo: get('adds_points_to'),
  //       points: Number(get('points')) || 0,
  //     };
  //   });
  //   this.logger.log(`Loaded ${this.rules.length} assessment rules`);
  // }

  /** Full pipeline. Returns internal + surfaced data. */
  score(input: AssessmentInput): ScoringResult {
    const scores: Record<string, number> = {};
    const add = (mapId: string, pts: number) => {
      if (!mapId || mapId === 'none' || pts === 0) return;
      scores[mapId] = (scores[mapId] ?? 0) + pts;
    };

    // STEP 1 + 2 — coping answers and stressors carry pattern weights.
    for (const answerId of input.copingAnswerIds) {
      this.rules
        .filter((r) => r.type === 'COPING' && r.answerId === answerId)
        .forEach((r) => add(r.addsPointsTo, r.points));
    }
    for (const stressorId of input.stressorIds) {
      this.rules
        .filter((r) => r.type === 'STRESSOR' && r.sourceId === stressorId)
        .forEach((r) => add(r.addsPointsTo, r.points));
    }

    // STEP 3 — childhood score amplifies all accumulated pattern scores.
    const childhoodScore = this.computeChildhoodScore(input.childhoodAnswers);
    const { tier, multiplier } = this.resolveTier(childhoodScore);

    const rankedPatterns: ScoredPattern[] = Object.entries(scores)
      .map(([traceMapId, rawScore]) => ({
        traceMapId,
        rawScore,
        finalScore: Math.round(rawScore * multiplier * 100) / 100,
      }))
      // STEP 4 — rank by final score, descending.
      .sort((a, b) => b.finalScore - a.finalScore);

    // STEP 4 — only surface patterns above the threshold; top 3 max.
    const surfacedPatternIds = rankedPatterns
      .filter((p) => p.finalScore >= MINIMUM_THRESHOLD)
      .slice(0, MAX_SURFACED)
      .map((p) => p.traceMapId);

    return {
      childhoodScore, // internal only — controller must NOT expose this
      childhoodTier: tier,
      multiplier,
      tierLanguage: TIER_LANGUAGE[tier],
      rankedPatterns,
      surfacedPatternIds,
    };
  }

  /**
   * Childhood score: 0-10.
   * - "safe adult" question (reverse_scored) -> a "No" adds 1 point.
   * - all other childhood questions -> a "Yes" adds 1 point.
   * The reverse-scored ids are declared in childhood_questions.json.
   */
  private computeChildhoodScore(answers: Record<string, boolean>): number {
    const reverseScoredIds = this.getReverseScoredIds();
    let score = 0;
    for (const [questionId, answeredYes] of Object.entries(answers)) {
      if (reverseScoredIds.has(questionId)) {
        if (answeredYes === false) score += 1; // protective: "No" = adversity
      } else {
        if (answeredYes === true) score += 1;
      }
    }
    return Math.min(score, 10);
  }

  private reverseScoredCache: Set<string> | null = null;
private getReverseScoredIds(): Set<string> {
  if (this.reverseScoredCache) return this.reverseScoredCache;
  const p = path.join(
    process.cwd(),
    'src',
    'modules',
    'seed',
    'data',
    'childhood_questions.json',
  );
  const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
  this.reverseScoredCache = new Set(
    (data.questions as Array<{ id: string; reverse_scored: boolean }>)
      .filter((q) => q.reverse_scored)
      .map((q) => q.id),
  );
  return this.reverseScoredCache;
}

  private resolveTier(childhoodScore: number): {
    tier: ChildhoodTier;
    multiplier: number;
  } {
    if (childhoodScore >= 7) return { tier: 'high', multiplier: 1.5 };
    if (childhoodScore >= 4) return { tier: 'clear', multiplier: 1.25 };
    return { tier: 'gentle', multiplier: 1.0 };
  }
}
