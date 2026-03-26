import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCheckoutStatusCommand } from './command';
import { CheckoutRepository } from 'src/modules/order/infrastructure/repositories/checkout.repo';
import { Transactional } from '@mikro-orm/core';

@CommandHandler(UpdateCheckoutStatusCommand)
export class UpdateCheckoutStatusCommandHandler
  implements ICommandHandler<UpdateCheckoutStatusCommand>
{
  constructor(private readonly checkoutRepository: CheckoutRepository) {}

  @Transactional()
  async execute(command: UpdateCheckoutStatusCommand): Promise<void> {
    const { checkoutId, status } = command;
    const checkout = await this.checkoutRepository.findById(checkoutId);
    if (!checkout) {
      throw new Error('Checkout not found');
    }
    checkout.setStatus(status);
    await this.checkoutRepository.update(checkout);
    console.log(
      `[UpdateCheckoutStatusCommandHandler] Updated checkout status: ${status}`,
    );
  }
}
