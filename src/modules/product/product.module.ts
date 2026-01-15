import { Module, OnModuleInit } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductEntity } from './infrastructure/entities/product.entity';
import { ProductVariantEntity } from './infrastructure/entities/product-variant.entity';
import { ProductAttributeEntity } from './infrastructure/entities/product-attribute.entity';
import { ProductRepository } from './infrastructure/repositories/product.repo';
import { ProductController } from './presentation/controllers/product.controller';
import { CreateProductCommandHandler } from './application/commands/create-product/handler';
import { UpdateProductCommandHandler } from './application/commands/update-product/handler';
import { GetProductByIdQueryHandler } from './application/queries/get-product-by-id/handler';
import { ProductReadRepository } from './infrastructure/repositories/product.read.repo';
import { GetProductsByVendorIdQueryHandler } from './application/queries/get-products-by-vendor-id/handler';
import { PRODUCT_PUBLIC_SERVICE } from 'src/modules/product/application/public-services/product.public-service.interface';
import { ProductPublicService } from 'src/modules/product/application/public-services/product.public-service';
import { GetProductsBySearchTermQueryHandler } from './application/queries/get-products-by-search-term/handler';
import { GetVariantByIdQueryHandler } from './application/queries/get-variant-by-id/handler';
import { EventQueueRegistry } from 'src/shared/ddd/infrastructure/queue/event-queue.registry';
import { EVENT_NAMES } from 'src/shared/ddd/infrastructure/queue/constants/event-names';
import { QUEUE_NAMES } from 'src/shared/ddd/infrastructure/queue/constants/queue-names';

const CommandHandlers = [
  CreateProductCommandHandler,
  UpdateProductCommandHandler,
];
const QueryHandlers = [
  GetProductByIdQueryHandler,
  GetProductsByVendorIdQueryHandler,
  GetProductsBySearchTermQueryHandler,
  GetVariantByIdQueryHandler,
];

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ProductEntity,
      ProductVariantEntity,
      ProductAttributeEntity,
    ]),
    CqrsModule,
  ],

  controllers: [ProductController],
  providers: [
    {
      provide: PRODUCT_PUBLIC_SERVICE,
      useClass: ProductPublicService,
    },
    ProductRepository,
    ProductReadRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [PRODUCT_PUBLIC_SERVICE],
})
export class ProductModule implements OnModuleInit {
  constructor(private readonly eventRegistry: EventQueueRegistry) {}

  onModuleInit() {
    // Subscribe product events to the product queue
    this.eventRegistry.subscribe(
      EVENT_NAMES.PRODUCT_CREATED,
      QUEUE_NAMES.PRODUCT_QUEUE,
    );
    this.eventRegistry.subscribe(
      EVENT_NAMES.PRODUCT_UPDATED,
      QUEUE_NAMES.PRODUCT_QUEUE,
    );
  }
}
