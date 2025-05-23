import chromium from 'chrome-aws-lambda';
import 'dotenv/config';
import { promises as fsp } from 'fs';
import path from 'path';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { getObject, uploadObject } from './S3';
import { createZipFromFolder, deleteFolderIfExists, extractZip } from './ZipUtils';
import { env } from './config';

const ROOT = "./"
const AUTH_DIR = '.wwebjs_auth';
const CACHE_DIR = '.wwebjs_cache';
const folders = [AUTH_DIR, CACHE_DIR];
const zipFiles = folders.map(folder => `${folder}.zip`);
const BUCKET = env.S3_BUCKET_MESSAGES!;
const WHATSAPP_PREFIX = 'whatsapp/';

async function syncWhatsappFromS3() {
    for (const dir of folders) {
        await deleteFolderIfExists(ROOT + dir);
    }

    for (const zipFile of zipFiles) {
        const s3Key = `${WHATSAPP_PREFIX}${zipFile}`;
        const localZipPath = path.join(ROOT, zipFile);

        const content = await getObject(BUCKET, s3Key, true) as Buffer;
        await fsp.writeFile(localZipPath, content);

        await extractZip(localZipPath, './');
        await fsp.unlink(localZipPath);
    }
}

async function syncWhatsappToS3() {
    for (const folder of folders) {
        const zipFileName = `${path.join(ROOT, folder)}.zip`;
        const localZipPath = path.join('./', zipFileName);

        await createZipFromFolder(path.join(ROOT, folder), localZipPath);

        const content = await fsp.readFile(localZipPath);
        const s3Key = `${WHATSAPP_PREFIX}${path.basename(zipFileName)}`;
        await uploadObject(BUCKET, s3Key, content);

        await fsp.unlink(localZipPath);
        await deleteFolderIfExists(path.join(ROOT, folder));
    }
}

export async function sendWhatsappMessage(groupId: string, message: string): Promise<any> {
    console.log('Syncing Whatsapp auth..');
    await syncWhatsappFromS3();
    const client = new Client({
        authStrategy: new LocalAuth({ dataPath: AUTH_DIR }),
        puppeteer: {
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        }
    });

    return new Promise((resolve, reject) => {
        client.on('ready', async () => {
            try {
                console.log('Sending message to group..');
                const response = await client.sendMessage(groupId, message);
                resolve(response);
            } catch (error) {
                reject(error);
            } finally {
                await new Promise(res => setTimeout(res, 2000));
                await client.destroy();
                await new Promise(res => setTimeout(res, 2000));
                console.log('Syncing Whatsapp auth back to S3..');
                await syncWhatsappToS3();
            }
        });
        client.on('qr', () => { });
        client.initialize();
    });
}
