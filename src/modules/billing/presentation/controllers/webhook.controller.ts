import { Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { BillingWebhookService } from '../../application/services/billing-webhook.service';

@Controller('billing/webhooks')
export class WebhookController {
  constructor(private readonly billingWebhookService: BillingWebhookService) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    await this.billingWebhookService.handleStripeWebhook(
      req.rawBody!,
      signature,
    );
    return { received: true };
  }
}
