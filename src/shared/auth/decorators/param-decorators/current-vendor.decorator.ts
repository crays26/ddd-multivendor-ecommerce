import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { VendorId } from 'src/shared/auth/types/auth-payload.type';

export const CurrentVendor = createParamDecorator(
  (_data, ctx: ExecutionContext): VendorId => {
    const req = ctx.switchToHttp().getRequest();
    return req.vendorId;
  },
);
