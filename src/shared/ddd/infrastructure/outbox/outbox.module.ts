import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OutboxEntity } from './outbox.entity';
import { OutboxRepository } from './outbox.repo';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([OutboxEntity])],
  providers: [OutboxRepository],
  exports: [OutboxRepository],
})
export class ShareOutboxModule {}
