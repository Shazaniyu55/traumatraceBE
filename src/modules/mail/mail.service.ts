import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface TherapistContactPayload {
  to: string; // therapist email
  therapistName: string;
  fromName: string;
  fromEmail?: string;
  message: string;
}

/**
 * Outbound email via Resend (config lives under common.resend.*).
 * If RESEND_API_KEY is not configured, sends are skipped with a warning so
 * the rest of the request still succeeds in local/dev environments.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail?: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('common.resend.apiKey');
    this.fromEmail = this.config.get<string>('common.resend.fromEmail');
    this.resend = apiKey ? new Resend(apiKey) : null;
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY not set — outbound emails will be skipped');
    }
  }

  async sendTherapistContact(p: TherapistContactPayload): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`Skipping contact email to ${p.to} (no Resend client)`);
      return;
    }

    const subject = `New contact request from ${p.fromName} via TraumaTrace`;
    const replyLine = p.fromEmail
      ? `<p>You can reply directly to this email to reach them at <strong>${p.fromEmail}</strong>.</p>`
      : '';

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1a1a1a;">
        <p>Hi ${p.therapistName},</p>
        <p><strong>${p.fromName}</strong> reached out to you through the TraumaTrace app.</p>
        <blockquote style="margin: 16px 0; padding: 12px 16px; border-left: 3px solid #888; background: #f6f6f6;">
          ${this.escapeHtml(p.message).replace(/\n/g, '<br/>')}
        </blockquote>
        ${replyLine}
        <p style="color:#888; font-size: 12px; margin-top: 24px;">Sent via TraumaTrace · Find Support</p>
      </div>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail!,
        to: p.to,
        subject,
        html,
        // NOTE: resend SDK v3+ uses `replyTo`. If you are on an older SDK,
        // change this key to `reply_to`.
        ...(p.fromEmail ? { replyTo: p.fromEmail } : {}),
      } as any);
    } catch (e) {
      this.logger.error(`Failed to send contact email: ${(e as Error).message}`);
      throw e;
    }
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}