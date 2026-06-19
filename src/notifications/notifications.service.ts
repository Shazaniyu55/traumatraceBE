import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

/**
 * Push notifications via Firebase Cloud Messaging.
 * Used e.g. for daily Motivation Card nudges.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(private readonly firebase: FirebaseService) {}

  async sendToToken(token: string, title: string, body: string) {
    if (!token) return;
    try {
      await this.firebase.messaging.send({
        token,
        notification: { title, body },
      });
    } catch (e) {
      this.logger.warn(`FCM send failed: ${(e as Error).message}`);
    }
  }
}
