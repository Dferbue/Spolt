import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService {
    private minioClient: Minio.Client;
  private bucketName :string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    
    this.bucketName = this.configService.get('MINIO_BUCKET_NAME') || 'spolt-image-users';

    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get('MINIO_PORT') || '9000', 10),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ROOT_USER'),
      secretKey: this.configService.get('MINIO_ROOT_PASSWORD'),
    });
    await this.ensureBucket();
  }

  async ensureBucket() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName);
      }
    } catch (error) {
      console.error('Error creating bucket:', error);
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const objectName = `${Date.now()}-${file.originalname}`;

    const metaData = {
    'Content-Type': file.mimetype,
  };

    await this.minioClient.putObject(this.bucketName, objectName, file.buffer, file.size,metaData);
    return objectName;
  }

  async getPresignedUrl(objectName: string) {
    return this.minioClient.presignedGetObject(this.bucketName, objectName, 24 * 60 * 60);
  }

  //Creamos un metodo para subir el formato buffer
  async uploadBuffer(buffer: Buffer, originalName: string, mimeType: string = 'image/png') {
  const objectName = `${Date.now()}-${originalName}`;
  const metaData = {
    'Content-Type': mimeType,
  };
  await this.minioClient.putObject(this.bucketName, objectName, buffer, buffer.length, metaData);
  return objectName;
}

  async getObject(objectName: string) {
    return this.minioClient.getObject(this.bucketName, objectName);
  }

  async getStat(objectName: string) {
    return this.minioClient.statObject(this.bucketName, objectName);
  }
}
