import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import "dotenv/config";

const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-west-1' });

export async function uploadObject(bucket: string, key: string, body: string | Buffer, metadata?: Record<string, string>) {
    await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        Metadata: metadata,
    }));
}

export async function listObjects(bucket: string, prefix?: string) {
    const result = await s3.send(new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
    }));
    return result.Contents || [];
}

export async function getObject(bucket: string, key: string): Promise<string> {
    const { Body } = await s3.send(new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    }));
    return streamToString(Body);
}

export async function headObject(bucket: string, key: string) {
    const result = await s3.send(new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
    }));
    return result.Metadata || {};
}

export async function moveObject(bucket: string, key: string, archivePrefix = 'archive/') {
    const archiveKey = `${archivePrefix}${key}`;
    await s3.send(new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${key}`,
        Key: archiveKey,
    }));
    await s3.send(new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
    }));
    return archiveKey;
}

function streamToString(stream: any): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on('data', (chunk: any) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}
