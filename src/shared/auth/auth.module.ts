import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAccessStrategy } from './strategies/jwt.access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt.refresh.strategy';
import { VendorModule } from 'src/modules/vendor/vendor.module';

@Global()
@Module({
  imports: [
    VendorModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),
  ],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
  exports: [AuthService, VendorModule],
})
export class ShareAuthModule {}
