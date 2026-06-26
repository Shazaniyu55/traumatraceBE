import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../firebase/firebase-auth.guard';
import { UsersService } from '../service/users.service';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@Req() req) {
    const { id, email, displayName } = req.user;
    return { id, email, displayName };
  }

  // Register/refresh the device push token.
  @Post('fcm-token')
  async setToken(@Req() req, @Body('fcmToken') fcmToken: string) {
    await this.users.setFcmToken(req.user.id, fcmToken);
    return { ok: true };
  }

}
