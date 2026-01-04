import {
  Inject,
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v7 as uuidV7 } from 'uuid';
import { S3_CLIENT } from 'src/shared/ddd/infrastructure/providers/s3-client.provider';
import {
  ICloudStorage,
  PresignedUrlResult,
  UploadResult,
  ALLOWED_MIME_TYPES,
} from './cloud-storage.interface';

@Injectable()
export class CloudflareR2CloudStorageService implements ICloudStorage {
  private readonly bucketName: string;
  private readonly publicDomain: string;

  constructor(@Inject(S3_CLIENT) private readonly s3Client: S3Client) {
    this.bucketName = process.env.R2_BUCKET_NAME!;
    this.publicDomain = process.env.R2_PUBLIC_DOMAIN!;
  }

  async generatePresignedUploadUrl(
    contentType: string,
    originalName: string,
    prefix = 'uploads',
  ): Promise<PresignedUrlResult> {
    const allowedImages = ALLOWED_MIME_TYPES as readonly string[];

    if (!allowedImages.includes(contentType)) {
      throw new BadRequestException(
        `Invalid media type for Product. Allowed: ${allowedImages.join(', ')}`,
      );
    }

    const fileExtension = originalName.split('.').pop();
    const key = `${prefix}/${uuidV7()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    try {
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 300,
      });

      return {
        uploadUrl,
        publicUrl: `${this.publicDomain}/${key}`,
        key,
      };
    } catch (error) {
      throw new InternalServerErrorException('Storage service error');
    }
  }

  async upload(
    fileBuffer: Buffer,
    contentType: string,
    originalName: string,
    prefix = 'uploads',
  ): Promise<UploadResult> {
    const fileExtension = originalName.split('.').pop();
    const key = `${prefix}/${uuidV7()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    try {
      await this.s3Client.send(command);

      return {
        publicUrl: `${this.publicDomain}/${key}`,
        key,
      };
    } catch (error) {
      throw new InternalServerErrorException('File upload failed');
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      throw new InternalServerErrorException('File deleted failed');
    }
  }
}
