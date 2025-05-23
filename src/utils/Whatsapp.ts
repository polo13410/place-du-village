import 'dotenv/config';
import { Client, LocalAuth } from 'whatsapp-web.js';

function getS3AuthPath() {
    const bucket = process.env.S3_BUCKET_MESSAGES!;
    if (!bucket) throw new Error('BUCKET_NAME env variable is required');
    return './.wwebjs_auth_s3';
}

export async function sendWhatsappMessage(groupId: string, message: string): Promise<any> {
    const client = new Client({
        authStrategy: new LocalAuth({ dataPath: getS3AuthPath() })
    });

    return new Promise((resolve, reject) => {
        client.on('ready', async () => {
            try {
                const response = await client.sendMessage(groupId, message);
                resolve(response);
            } catch (error) {
                reject(error);
            } finally {
                await new Promise(res => setTimeout(res, 2000));
                client.destroy();
            }
        });
        client.on('qr', () => { });
        client.initialize();
    });
}
