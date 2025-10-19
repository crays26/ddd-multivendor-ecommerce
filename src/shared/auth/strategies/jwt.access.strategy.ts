import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthPayload } from '../types/auth-payload.type';
import { Request } from 'express';
import { AuthService } from 'src/shared/auth/auth.service';
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.['access_token'],
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET_KEY!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: AuthPayload) {
    const token: string | undefined = req.cookies?.['access_token'];
    if (!token) throw new UnauthorizedException('Missing access token');

    const isBlacklisted = await this.authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Access token has been blacklisted');
    }

    return payload;
  }
}
