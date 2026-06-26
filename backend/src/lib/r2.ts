import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../env.js';

const enabled = !!(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY);

export const r2 = enabled ? new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID!, secretAccessKey: env.R2_SECRET_ACCESS_KEY! },
}) : null;

export async function uploadObject(key: string, body: Buffer, contentType: string) {
  if (!r2) { console.warn('[r2] not configured — skipping upload', key); return `local-stub://${key}`; }
  await r2.send(new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, Body: body, ContentType: contentType }));
  return env.R2_PUBLIC_URL ? `${env.R2_PUBLIC_URL}/${key}` : key;
}

export async function deleteObject(key: string) {
  if (!r2) return;
  await r2.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
}

export async function presignUpload(key: string, contentType: string, expiresIn = 300) {
  if (!r2) throw new Error('R2 not configured');
  return getSignedUrl(r2, new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, ContentType: contentType }), { expiresIn });
}
