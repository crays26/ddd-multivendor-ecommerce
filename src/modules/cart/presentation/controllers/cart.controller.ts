import { GetCartSummaryQuery } from '../../application/queries/get-cart-summary/query';
import { CartSummaryDto } from '../../application/queries/get-cart-summary/dto';
import { AddItemToCartCommand } from '../../application/commands/add-item-to-cart/command';
import { AddItemToCartDto } from '../../application/commands/add-item-to-cart/dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt/jwt.required.guard';
import { JwtOptionalGuard } from 'src/shared/auth/guards/jwt/jwt.optional.guard';
import { CurrentUser } from 'src/shared/auth/decorators/param-decorators/current-user.decorator';
import { AuthPayload } from 'src/shared/auth/types/auth-payload.type';
import { GetGuestCartSummaryQuery } from '../../application/queries/get-guest-cart-summary/query';

@Controller('cart')
export class CartController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(JwtOptionalGuard)
  @Get('summary')
  async getCartSummary(
    @CurrentUser() user: AuthPayload | undefined,
    @Req() req: Request,
  ): Promise<CartSummaryDto> {
    if (user) {
      return await this.queryBus.execute(new GetCartSummaryQuery(user.id));
    }
    return await this.queryBus.execute(
      new GetGuestCartSummaryQuery(req.cookies['guest-cart-session-id']),
    );
  }

  @UseGuards(JwtOptionalGuard)
  @Post('items')
  async addItemToCart(
    @CurrentUser() currentUser: AuthPayload | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: AddItemToCartDto,
  ): Promise<void> {
    const command = new AddItemToCartCommand({
      productVariantId: body.productVariantId,
      quantity: body.quantity,
      customerId: currentUser?.id,
      guestCartSessionId: req.cookies['guest-cart-session-id'],
    });
    const sessionId = await this.commandBus.execute(command);
    if (sessionId) {
      res.cookie('guest-session-id', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
  }
}
