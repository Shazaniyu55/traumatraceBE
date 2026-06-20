import {
  CanActivate, ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { UsersService } from '../users/users.service';

/**
 * Verifies the "Authorization: Bearer <firebase-id-token>" header, then
 * upserts and attaches the local User to request.user.
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers['authorization'];
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const idToken = header.slice('Bearer '.length);
    try {
      const decoded = await this.firebase.auth.verifyIdToken(idToken);
      const user = await this.users.upsertFromFirebase({
        firebaseUid: decoded.uid,
        email: decoded.email,
        displayName: decoded.name,
      });
      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
