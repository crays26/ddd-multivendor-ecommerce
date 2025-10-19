import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RoleId } from 'src/shared/auth/types/role.type';
import { ROLES_KEY } from '../../decorators/class-decorators/roles.decorator';
import { AuthPayload } from '../../types/auth-payload.type';

@Injectable()
export class RequiredRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleId[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const user: AuthPayload = context.switchToHttp().getRequest().user;
    if (!user?.roles || user.roles.length === 0) {
      return false;
    }
    return requiredRoles.every((role) => user.roles.includes(role));
  }
}
