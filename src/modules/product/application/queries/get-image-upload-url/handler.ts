import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProductImageUploadUrlQuery } from './query';
import {
  CLOUD_STORAGE,
  ICloudStorage,
  PresignedUrlResult,
} from 'src/shared/ddd/infrastructure/cloud-storage/cloud-storage.interface';

@QueryHandler(GetProductImageUploadUrlQuery)
export class GetProductImageUploadUrlHandler
  implements IQueryHandler<GetProductImageUploadUrlQuery>
{
  constructor(
    @Inject(CLOUD_STORAGE) private readonly cloudStorage: ICloudStorage,
  ) {}

  async execute(
    query: GetProductImageUploadUrlQuery,
  ): Promise<PresignedUrlResult> {
    const { fileName, contentType } = query;
    return await this.cloudStorage.generatePresignedUploadUrl(
      contentType,
      fileName,
      'products',
    );
  }
}
