import { Query } from '@nestjs/cqrs';
import { PresignedUrlResult } from 'src/shared/ddd/infrastructure/cloud-storage/cloud-storage.interface';

export class GetProductImageUploadUrlQuery extends Query<PresignedUrlResult> {
  constructor(
    public readonly fileName: string,
    public readonly contentType: string,
  ) {
    super();
  }
}
