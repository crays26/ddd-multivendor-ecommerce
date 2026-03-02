import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt/jwt.required.guard';
import { CurrentUser } from 'src/shared/auth/decorators/param-decorators/current-user.decorator';
import { AuthPayload } from 'src/shared/auth/types/auth-payload.type';
import { GetCartSummaryQuery } from '../../application/queries/get-cart-summary/query';
import { CartSummaryDto } from '../../application/queries/get-cart-summary/dto';

@Controller('cart')
export class CartController {
  constructor(private readonly queryBus: QueryBus) {}

  @UseGuards(JwtRequiredGuard)
  @Get('summary')
  async getCartSummary(
    @CurrentUser() user: AuthPayload,
  ): Promise<CartSummaryDto> {
    return await this.queryBus.execute(new GetCartSummaryQuery(user.id));
  }
}
