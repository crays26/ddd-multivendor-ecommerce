import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AuthPayload } from './AuthPayload';
import * as bcrypt from 'bcrypt';

const SALT_ROUND = 10;

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateTokens(payload: AuthPayload) {
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m', secret: process.env.ACCESS_TOKEN_SECRET_KEY! });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d', secret: process.env.REFRESH_TOKEN_SECRET_KEY! });
    return { accessToken, refreshToken };
  }

  setAuthCookies(response: Response, tokens: { accessToken: string; refreshToken: string }) {
    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 15 * 60 * 1000,
    });
    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  clearAuthCookies(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
  }

  async hash(string: string) {
    return await bcrypt.hash(string, SALT_ROUND);
  }
}
