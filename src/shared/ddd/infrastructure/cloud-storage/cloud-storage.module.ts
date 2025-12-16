import { Global, Module } from '@nestjs/common';
import { CLOUD_STORAGE } from 'src/shared/ddd/infrastructure/cloud-storage/cloud-storage.interface';
import { S3ClientProvider } from 'src/shared/ddd/infrastructure/providers/s3-client.provider';
import { CloudflareR2CloudStorageService } from 'src/shared/ddd/infrastructure/cloud-storage/cloudflare-r2.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    S3ClientProvider,
    {
      provide: CLOUD_STORAGE,
      useClass: CloudflareR2CloudStorageService,
    },
  ],
  exports: [CLOUD_STORAGE],
})
export class ShareCloudStorageModule {}
