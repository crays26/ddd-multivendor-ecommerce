import { Query } from '@nestjs/cqrs';
import { GuestCartSummaryDto } from './dto';

export class GetGuestCartSummaryQuery extends Query<GuestCartSummaryDto> {
  constructor(public readonly guestCartSessionId?: string) {
    super();
  }
}
