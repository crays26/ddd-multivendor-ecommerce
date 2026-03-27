import { GetCartSummaryQuery } from '../../application/queries/get-cart-summary/query';
import { CartSummaryDto } from '../../application/queries/get-cart-summary/dto';
import { AddItemToCartCommand } from '../../application/commands/add-item-to-cart/command';
import { AddItemToCartDto } from '../../application/commands/add-item-to-cart/dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt/jwt.required.guard';
import { JwtOptionalGuard } from 'src/shared/auth/guards/jwt/jwt.optional.guard';
import { CurrentUser } from 'src/shared/auth/decorators/param-decorators/current-user.decorator';
import { AuthPayload } from 'src/shared/auth/types/auth-payload.type';

@Controller('cart')
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(JwtRequiredGuard)
  @Get('summary')
  async getCartSummary(
    @CurrentUser() user: AuthPayload,
  ): Promise<CartSummaryDto> {
    return await this.queryBus.execute(new GetCartSummaryQuery(user.id));
  }

  @UseGuards(JwtOptionalGuard)
  @Post('items')
  async addItemToCart(
    @CurrentUser() currentUser: AuthPayload | null,
    @Req() req: Request,
    @Body() body: AddItemToCartDto,
  ): Promise<void> {
    if (!currentUser) {
      if (!req.session.cart) {
        req.session.cart = [];
      }

      const existingItem = req.session.cart.find(
        (item) => item.productVariantId === body.productVariantId,
      );

      console.log('session');

      if (existingItem) {
        existingItem.quantity += body.quantity;
      } else {
        req.session.cart.push({
          productVariantId: body.productVariantId,
          quantity: body.quantity,
        });
      }
    } else {
      console.log('command');
      const command = new AddItemToCartCommand({
        productVariantId: body.productVariantId,
        quantity: body.quantity,
        customerId: currentUser.id,
      });
      await this.commandBus.execute(command);
    }
  }
}
