import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthPayload } from '../types/auth-payload.type';


@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.['refresh_token'],
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET_KEY!,
    });
  }

  async validate(payload: AuthPayload) {
    return payload;
  }
}
