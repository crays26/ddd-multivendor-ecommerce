import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCheckoutStatusQuery } from './query';
import { EntityManager } from '@mikro-orm/postgresql';
import { CheckoutEntity } from '../../../infrastructure/entities/checkout.entity';
import { NotFoundException } from '@nestjs/common';

export interface CheckoutStatusDto {
  id: string;
  status: string;
}

@QueryHandler(GetCheckoutStatusQuery)
export class GetCheckoutStatusQueryHandler
  implements IQueryHandler<GetCheckoutStatusQuery, CheckoutStatusDto>
{
  constructor(private readonly em: EntityManager) {}

  async execute(query: GetCheckoutStatusQuery): Promise<CheckoutStatusDto> {
    const checkout = await this.em.findOne(CheckoutEntity, { id: query.checkoutId });
    if (!checkout) {
      throw new NotFoundException('Checkout not found');
    }

    const dto: CheckoutStatusDto = {
      id: checkout.id,
      status: checkout.status,
    };

    return dto;
  }
}
