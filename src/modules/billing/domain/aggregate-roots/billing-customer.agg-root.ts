import { BadRequestException } from '@nestjs/common';
import { AggregateRootBase } from 'src/shared/ddd/domain/base/aggregate-root.base';
import { v7 as uuidV7 } from 'uuid';

interface BillingCustomerProps {
  id: string;
  accountId: string;
  providerCustomerId?: string;
  defaultPaymentMethodId?: string;
}

interface CreateBillingCustomerProps {
  accountId: string;
  providerCustomerId?: string;
  defaultPaymentMethodId?: string;
}

export class BillingCustomerAggRoot extends AggregateRootBase<
  string,
  BillingCustomerProps
> {
  private constructor(props: BillingCustomerProps) {
    super(props);
    this.validate(props);
  }

  static create(props: CreateBillingCustomerProps): BillingCustomerAggRoot {
    return new BillingCustomerAggRoot({
      id: uuidV7(),
      accountId: props.accountId,
      providerCustomerId: props.providerCustomerId,
      defaultPaymentMethodId: props.defaultPaymentMethodId,
    });
  }

  static rehydrate(props: BillingCustomerProps): BillingCustomerAggRoot {
    return new BillingCustomerAggRoot(props);
  }

  private validate(props: BillingCustomerProps): void {
    if (!props.accountId) {
      throw new BadRequestException('accountId is required');
    }
  }

  getAccountId(): string {
    return this.props.accountId;
  }

  getProviderCustomerId(): string | undefined {
    return this.props.providerCustomerId;
  }

  getDefaultPaymentMethodId(): string | undefined {
    return this.props.defaultPaymentMethodId;
  }

  setProviderCustomerId(id: string): void {
    this.props.providerCustomerId = id;
  }

  setDefaultPaymentMethod(id: string | undefined): void {
    this.props.defaultPaymentMethodId = id;
  }
}





