import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { GetProductImageUploadUrlQuery } from './query';
import {
  CLOUD_STORAGE,
  ICloudStorage,
  ALLOWED_MIME_TYPES,
  PresignedUrlResult,
} from 'src/shared/ddd/infrastructure/cloud-storage/cloud-storage.interface';

@QueryHandler(GetProductImageUploadUrlQuery)
export class GetProductImageUploadUrlHandler implements IQueryHandler<GetProductImageUploadUrlQuery> {
    constructor(
        @Inject(CLOUD_STORAGE) private readonly cloudStorage: ICloudStorage,
    ) {}

    async execute(query: GetProductImageUploadUrlQuery): Promise<PresignedUrlResult> {
        const { fileName, contentType } = query;

        const allowedImages = ALLOWED_MIME_TYPES as readonly string[];
        if (!allowedImages.includes(contentType)) {
            throw new BadRequestException(`Invalid media type for Product. Allowed: ${allowedImages.join(', ')}`);
        }
        const result = await this.cloudStorage.generatePresignedUrl(
            contentType,
            fileName,
            'products'
        );

        return {
            uploadUrl: result.uploadUrl,
            publicUrl: result.publicUrl,
            key: result.key,
        };
    }
}