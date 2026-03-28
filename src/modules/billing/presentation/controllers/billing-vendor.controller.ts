import {
  Body,
  Controller,
  Post,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from 'src/shared/auth/decorators/class-decorators/roles.decorator';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt/jwt.required.guard';
import { RequiredRolesGuard } from 'src/shared/auth/guards/role/roles.guard';
import { AuthPayload, VendorId } from 'src/shared/auth/types/auth-payload.type';
import { CurrentUser } from 'src/shared/auth/decorators/param-decorators/current-user.decorator';
import { RoleName } from 'src/shared/auth/types/role.type';
import { RegisterVendorStripeAccountCommand } from '../../application/commands/register-vendor-stripe-account/command';
import { RegisterVendorStripeAccountDto } from '../../application/commands/register-vendor-stripe-account/dto';
import { CurrentVendor } from 'src/shared/auth/decorators/param-decorators/current-vendor.decorator';

@Controller('billing-vendor')
export class BillingVendorController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Roles(RoleName.VENDOR)
  @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
  @Post('register-stripe')
  async registerStripeAccount(
    @CurrentUser() user: AuthPayload,
    @CurrentVendor() currentVendorId: VendorId,
    @Body() body: RegisterVendorStripeAccountDto,
  ): Promise<{ url: string }> {
    const returnUrl = `${process.env.FRONTEND_URL}/onboarding/complete`;
    const refreshUrl = `${process.env.FRONTEND_URL}/onboarding/refresh`;

    const command = new RegisterVendorStripeAccountCommand({
      vendorId: currentVendorId,
      email: body.email,
      businessName: body.businessName,
      country: body.country,
      returnUrl,
      refreshUrl,
    });

    return await this.commandBus.execute(command);
  }
}
