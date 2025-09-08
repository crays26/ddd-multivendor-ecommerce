import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {Observable} from "rxjs";
import { Role } from "../../enums/role.enum";
import { ROLES_KEY } from "../../decorators/class-decorators/roles.decorator";
import { AuthPayload } from "../../AuthPayload.interface";


@Injectable()
export class RequiredRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const user: AuthPayload = context.switchToHttp().getRequest().user;
    if (!user?.roles || user.roles.length === 0) {
      return false;
    }
    const userRoleNames = user.roles.map(r => r.name);

    return requiredRoles.every(role => userRoleNames.includes(role));
  }
}