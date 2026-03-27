import { BadRequestException } from '@nestjs/common';
import { AggregateRootBase } from 'src/shared/ddd/domain/base/aggregate-root.base';
import { v7 as uuidV7 } from 'uuid';

interface BillingVendorProps {
  id: string;
  vendorId: string;
  providerAccountId?: string;
}

interface CreateBillingVendorProps {
  vendorId: string;
  providerAccountId?: string;
}

export class BillingVendorAggRoot extends AggregateRootBase<
  string,
  BillingVendorProps
> {
  private constructor(props: BillingVendorProps) {
    super(props);
    this.validate(props);
  }

  static create(props: CreateBillingVendorProps): BillingVendorAggRoot {
    return new BillingVendorAggRoot({
      id: uuidV7(),
      vendorId: props.vendorId,
      providerAccountId: props.providerAccountId,
    });
  }

  static rehydrate(props: BillingVendorProps): BillingVendorAggRoot {
    return new BillingVendorAggRoot(props);
  }

  private validate(props: BillingVendorProps): void {
    if (!props.vendorId) {
      throw new BadRequestException('vendorId is required');
    }
  }

  getVendorId(): string {
    return this.props.vendorId;
  }

  getProviderAccountId(): string | undefined {
    return this.props.providerAccountId;
  }

  setProviderAccountId(id: string): void {
    this.props.providerAccountId = id;
  }
}





