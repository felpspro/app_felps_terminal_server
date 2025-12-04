import config from '#config';
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "us-east-1",
  endpoint: config.minio.endPoint, // ex: http://177.136.233.55:9000
  credentials: {
    accessKeyId: config.minio.accessKey,
    secretAccessKey: config.minio.secretKey,
  },
  forcePathStyle: true, // obrigatório para MinIO
});