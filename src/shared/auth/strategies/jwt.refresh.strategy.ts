import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthPayload } from '../types/auth-payload.type';
import { Request } from 'express';

import { AuthService } from 'src/shared/auth/auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.['refresh_token'],
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET_KEY!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: AuthPayload) {
    const token: string | undefined = req.cookies?.['refresh_token'];
    if (!token) throw new UnauthorizedException('Missing refresh token');

    const isBlacklisted = await this.authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Refresh token has been blacklisted');
    }

    return payload;
  }
}
