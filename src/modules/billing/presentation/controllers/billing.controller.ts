import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateSetupIntentDto } from '../dtos/requests/create-setup-intent.dto';
import { CreateSetupIntentCommand } from '../../application/commands/create-setup-intent/command';
import { TransactionDto } from '../../application/dtos/transaction.dto';
import { GetTransactionByIdQuery } from '../../application/queries/get-transaction-by-id/query';
import { JwtRequiredGuard } from 'src/shared/auth/guards/jwt/jwt.required.guard';
import { GetTransactionByCheckoutIdQuery } from '../../application/queries/get-transaction-by-checkout-id/query';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('customers/setup-intents')
  async createSetupIntent(@Body() body: CreateSetupIntentDto): Promise<{
    billingCustomerId: string;
    providerSetupIntentId: string;
    clientSecret?: string;
    status: string;
  }> {
    return this.commandBus.execute(new CreateSetupIntentCommand(body));
  }

  @UseGuards(JwtRequiredGuard)
  @Get('transactions/checkout/:id')
  async getTransactionByCheckoutId(
    @Param('id') checkoutId: string,
  ): Promise<TransactionDto | null> {
    return this.queryBus.execute(
      new GetTransactionByCheckoutIdQuery(checkoutId),
    );
  }

  @Get('transactions/:id')
  async getTransaction(
    @Param('id') id: string,
  ): Promise<TransactionDto | null> {
    return this.queryBus.execute(new GetTransactionByIdQuery(id));
  }
}
