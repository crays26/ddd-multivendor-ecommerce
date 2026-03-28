import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RoleName } from 'src/shared/auth/types/role.type';
import { ROLES_KEY } from '../../decorators/class-decorators/roles.decorator';
import { AuthPayload } from '../../types/auth-payload.type';
import {
  IVendorPublicService,
  VENDOR_PUBLIC_SERVICE,
} from 'src/modules/vendor/application/public-services/vendor.public-service.interface';

@Injectable()
export class RequiredRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(VENDOR_PUBLIC_SERVICE)
    private readonly vendorPublicService: IVendorPublicService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthPayload = request.user;

    if (!user?.roles || user.roles.length === 0) {
      return false;
    }
    const hasRoles = requiredRoles.every((role) => user.roles.includes(role));
    if (!hasRoles) return false;

    if (requiredRoles.includes(RoleName.VENDOR)) {
      const vendor = await this.vendorPublicService.getVendorByAccountId(
        user.id,
      );

      if (!vendor) {
        throw new UnauthorizedException(
          'You must be a registered vendor to perform this action.',
        );
      }

      request.vendorId = vendor.id;
    }

    return true;
  }
}
