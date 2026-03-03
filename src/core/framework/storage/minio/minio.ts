import { Client } from 'minio';
import { config } from '../../../config';

export class MinioService {
  private static instance: Client;

  private constructor() {}

  public static getInstance(): Client {
    if (!MinioService.instance) {
      MinioService.instance = new Client({
        endPoint: config.minio.endpoint,
        port: Number(config.minio.port) || 9000,
        useSSL: config.runningProd ? true : config.minio.useSSL === 'true', // Enforce SSL in production
        accessKey: config.minio.accessKey,
        secretKey: config.minio.secretKey,
      });
      console.info('MinIO client initialized securely.');
    }
    return MinioService.instance;
  }
}
