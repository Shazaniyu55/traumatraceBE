import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/** Serves the assessment content (the questions) to the Flutter app. */
@Injectable()
export class AssessmentsService {
  private read(file: string) {
    const p = path.join(__dirname, '..', 'seed', 'data', file);
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  }

  getContent() {
    const content = this.read('assessment_content.json');
    const childhood = this.read('childhood_questions.json');
    return {
      stressors: content.stressors,          // Step 1
      copingQuestions: content.coping_questions, // Step 2
      childhood: {                            // Step 3 (VACS-grounded)
        intro: childhood.intro,
        framework: childhood.framework,
        // Do NOT leak reverse_scored flags / scoring to the client.
        questions: childhood.questions.map((q: any) => ({
          id: q.id,
          prompt: q.prompt,
        })),
      },
    };
  }
}
