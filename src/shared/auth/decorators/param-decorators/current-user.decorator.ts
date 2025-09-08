import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthPayload } from '../../AuthPayload.interface';

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext): AuthPayload | null => {
    const req = ctx.switchToHttp().getRequest();
    return req.user || null;
  },
);
