import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Report } from '../core/entities/report.entity';
import { ScoringService } from '../scoring/scoring.service';
import { TraceMapsService } from '../trace-maps/trace-maps.service';
import { GlossaryService } from '../glossary/glossary.service';
import { SubmitAssessmentDto } from '../assessments/dto/submit-assessment.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly repo: Repository<Report>,
    private readonly scoring: ScoringService,
    private readonly traceMaps: TraceMapsService,
    private readonly glossary: GlossaryService,
  ) {}

  /**
   * Runs scoring, builds the displayable report (sections A-F), and persists it.
   * The childhood numeric score is used internally only and never written to a
   * user-facing field.
   */
  async generate(userId: string, dto: SubmitAssessmentDto): Promise<Report> {
    const result = this.scoring.score({
      stressorIds: dto.stressorIds,
      copingAnswerIds: dto.copingAnswerIds,
      childhoodAnswers: dto.childhoodAnswers,
    });

    const surfacedMaps = await this.traceMaps.findByIds(result.surfacedPatternIds);
    // preserve ranked order
    const orderedMaps = result.surfacedPatternIds
      .map((id) => surfacedMaps.find((m) => m.id === id))
      .filter(Boolean);

    // Collect glossary terms referenced by surfaced maps (Section C).
    const glossaryIds = Array.from(
      new Set(orderedMaps.flatMap((m) => m!.glossaryTerms)),
    );
    const glossaryTerms = await this.glossary.findByIds(glossaryIds);

    const stressorLabels = this.labelStressors(dto.stressorIds);

    const reportPayload = {
      // A. Current Stress Landscape
      currentStressLandscape: {
        stressors: stressorLabels,
        summary:
          stressorLabels.length > 0
            ? `Right now, the things weighing on you include ${this.humanList(stressorLabels)}.`
            : 'You did not flag any specific current stressors — that itself is worth noticing.',
      },
      // Tier framing language (gentle / clear / high)
      framing: result.tierLanguage,
      // B. Emerging Patterns + D. Trace Map (each surfaced pattern)
      patterns: orderedMaps.map((m) => ({
        id: m!.id,
        title: m!.title,
        traceMap: {
          nodes: m!.nodes, // pattern -> emotion -> adaptation -> origin
        },
        // F. Strengths (per pattern)
        strengths: m!.strengths,
        future: m!.future,
        // E. Reflection question (per pattern)
        reflection: m!.reflection,
        glossaryTerms: m!.glossaryTerms,
      })),
      // C. Related Concepts (glossary language layer)
      relatedConcepts: glossaryTerms.map((g) => ({
        id: g.id,
        term: g.term,
        definition: g.definition,
      })),
      // Empty-state guidance when nothing crossed threshold.
      quietResult:
        orderedMaps.length === 0
          ? 'Your answers did not point strongly to any single pattern today. That can mean things feel relatively settled, or that you held back — both are okay. You can revisit this anytime.'
          : null,
    };

    const report = this.repo.create({
      user_id: userId,
      assessmentInput: { ...dto } as Record<string, unknown>,
      reportPayload,
      childhoodTier: result.childhoodTier, // tier only, never the number
    });
    return this.repo.save(report);
  }

  findForUser(userId: string) {
    return this.repo.find({
      where: { user_id: userId },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(userId: string, id: string) {
    return this.repo.findOne({ where: { id, user_id: userId } });
  }

  // --- helpers ---
  private stressorLabelMap: Record<string, string> | null = null;
  private labelStressors(ids: string[]): string[] {
    if (!this.stressorLabelMap) {
      const p = path.join(__dirname, '..', 'seed', 'data', 'assessment_content.json');
      const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
      this.stressorLabelMap = Object.fromEntries(
        data.stressors.map((s: { id: string; label: string }) => [s.id, s.label]),
      );
    }
    return ids.map((id) => this.stressorLabelMap![id] ?? id);
  }

  private humanList(items: string[]): string {
    if (items.length <= 1) return items.join('');
    return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
  }
}
