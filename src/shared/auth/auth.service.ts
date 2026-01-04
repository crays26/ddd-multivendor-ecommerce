import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AuthPayload } from './types/auth-payload.type';
import * as bcrypt from 'bcrypt';
import { JwtTokenPair } from 'src/shared/auth/types/jwt-token-pair.type';
const SALT_ROUND = 10;
import { Cache } from '@nestjs/cache-manager';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('CACHE_MANAGER')
    private readonly cache: Cache,
  ) {}

  generateTokens(payload: AuthPayload): JwtTokenPair {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '10m',
      secret: process.env.ACCESS_TOKEN_SECRET_KEY!,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: process.env.REFRESH_TOKEN_SECRET_KEY!,
    });
    return { accessToken, refreshToken };
  }

  setAuthCookies(response: Response, tokens: JwtTokenPair): void {
    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 10 * 60 * 1000,
    });
    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
  }

  async hash(string: string): Promise<string> {
    return await bcrypt.hash(string, SALT_ROUND);
  }

  async blacklistTokenPair(tokenPair: JwtTokenPair): Promise<void> {
    const access = await this.jwtService.decode(tokenPair.accessToken);
    const accessRemainingTime = access.exp - Math.floor(Date.now() / 1000);
    const refresh = await this.jwtService.decode(tokenPair.refreshToken);
    const refreshRemainingTime = refresh.exp - Math.floor(Date.now() / 1000);
    await this.cache.set(
      `blacklist:${tokenPair.accessToken}`,
      '1',
      accessRemainingTime,
    );
    await this.cache.set(
      `blacklist:${tokenPair.refreshToken}`,
      '1',
      refreshRemainingTime,
    );
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return (await this.cache.get<string>(`blacklist:${token}`)) !== undefined;
  }
}
