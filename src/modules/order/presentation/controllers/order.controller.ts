import { Body, Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CheckoutCommand } from 'src/modules/order/application/commands/checkout/command';
import { GetCheckoutStatusQuery } from 'src/modules/order/application/queries/get-checkout-status/query';
import { CurrentUser } from 'src/shared/auth/decorators/param-decorators/current-user.decorator';
import { AuthPayload } from 'src/shared/auth/types/auth-payload.type';
import { CheckoutDto } from '../../application/commands/checkout/dto';
import { RequiredRolesGuard } from 'src/shared/auth/guards/role/roles.guard';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt/jwt.required.guard';
import { RoleName } from 'src/shared/auth/types/role.type';
import { Roles } from 'src/shared/auth/decorators/class-decorators/roles.decorator';

@Controller('/orders')
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Roles(RoleName.CUSTOMER)
  @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
  @Post('/checkout')
  async checkout(
    @CurrentUser() currentUser: AuthPayload,
    @Body() body: CheckoutDto,
  ) {
    return await this.commandBus.execute(
      new CheckoutCommand({
        customerId: currentUser.id,
        checkoutData: body,
      }),
    );
  }

  @Roles(RoleName.CUSTOMER)
  @UseGuards(JwtRequiredGuard, RequiredRolesGuard)
  @Get('/checkout/:id/status')
  async getCheckoutStatus(
    @CurrentUser() currentUser: AuthPayload,
    @Param('id') id: string,
  ) {
    return await this.queryBus.execute(new GetCheckoutStatusQuery(id));
  }
}
