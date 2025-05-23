import 'dotenv/config';
import { headObject, listObjects, moveObject } from '../utils/S3';
import { sendWhatsappMessage } from '../utils/Whatsapp';
import { env } from '../utils/config';

const S3_BUCKET_MESSAGES = env.S3_BUCKET_MESSAGES!;
const WHATSAPP_GROUP_ID = env.WHATSAPP_GROUP_ID!;

export const handler = async () => {
    console.log('Starting daily message process..');
    console.log('Fetching messages from S3 bucket..');
    const objects = await listObjects(S3_BUCKET_MESSAGES, "messages/");
    if (!objects.length) {
        return { statusCode: 404, body: 'No message found in bucket.' };
    }
    const firstObject = objects.filter(obj => !obj.Key?.endsWith("/"))[0];
    const key = firstObject.Key;
    if (!key) {
        return { statusCode: 400, body: 'No valid object key found.' };
    }
    const metadata = await headObject(S3_BUCKET_MESSAGES, key);
    const message = metadata['x-amz-meta-message'];
    if (!message) {
        return { statusCode: 400, body: 'No message content in metadata.' };
    }
    const decodedMessage = decodeURIComponent(message);
    const response = await sendWhatsappMessage(WHATSAPP_GROUP_ID, decodedMessage);

    console.log('Moving object to archive..');
    await moveObject(S3_BUCKET_MESSAGES, key);
    return { statusCode: 200, body: 'Process completed successfully, message sent: ' + response.body };
};
