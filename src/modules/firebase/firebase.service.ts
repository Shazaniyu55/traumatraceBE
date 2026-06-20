import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

/**
 * Initializes the Firebase Admin SDK once. Credentials come from the
 * GOOGLE_APPLICATION_CREDENTIALS env var (path to service-account JSON) or
 * the FIREBASE_SERVICE_ACCOUNT env var (raw JSON string).
 */
@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  onModuleInit() {
    if (admin.apps.length) return;
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (raw) {
        admin.initializeApp({
          credential: admin.credential.cert(JSON.parse(raw)),
        });
      } else {
        // Falls back to GOOGLE_APPLICATION_CREDENTIALS.
        admin.initializeApp({ credential: admin.credential.applicationDefault() });
      }
      this.logger.log('Firebase Admin initialized');
    } catch (e) {
      this.logger.error('Firebase init failed — auth & push will not work', e as Error);
    }
  }

  get auth() {
    return admin.auth();
  }

  get messaging() {
    return admin.messaging();
  }
}
