import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import "dotenv/config";
import { env } from './config';

const s3 = new S3Client({ region: env.AWS_REGION || 'eu-west-1' });

export async function uploadObject(bucket: string, key: string, body: string | Buffer, metadata?: Record<string, string>) {
    // Use Upload for streams or unknown length, fallback to PutObject for string/Buffer
    if (typeof body !== 'string' && !(body instanceof Buffer)) {
        const upload = new Upload({
            client: s3,
            params: {
                Bucket: bucket,
                Key: key,
                Body: body,
                Metadata: metadata,
            },
        });
        await upload.done();
    } else {
        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            Metadata: metadata,
        }));
    }
}

export async function listObjects(bucket: string, prefix?: string) {
    const result = await s3.send(new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
    }));
    return result.Contents || [];
}

export async function getObject(bucket: string, key: string, asBuffer: boolean = false): Promise<string | Buffer> {
    const { Body } = await s3.send(new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    }));
    return asBuffer ? streamToBuffer(Body) : streamToString(Body);
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

function streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on('data', (chunk: any) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}
