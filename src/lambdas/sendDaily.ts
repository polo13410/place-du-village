import 'dotenv/config';
import { headObject, listObjects, moveObject } from '../utils/S3';
import { sendWhatsappMessage } from '../utils/Whatsapp';

const S3_BUCKET_MESSAGES = process.env.S3_BUCKET_MESSAGES!;
const WHATSAPP_GROUP_ID = process.env.WHATSAPP_GROUP_ID!;

export const handler = async () => {
    const objects = await listObjects(S3_BUCKET_MESSAGES);
    if (!objects.length) {
        return { statusCode: 404, body: 'No message found in bucket.' };
    }
    const firstObject = objects[0];
    const key = firstObject.Key || '';
    if (!key) {
        return { statusCode: 400, body: 'No valid object key found.' };
    }
    const metadata = await headObject(S3_BUCKET_MESSAGES, key);
    const message = metadata['x-amz-meta-message'] || '';
    if (!message) {
        return { statusCode: 400, body: 'No message content in metadata.' };
    }
    const response = await sendWhatsappMessage(WHATSAPP_GROUP_ID, message);

    await moveObject(S3_BUCKET_MESSAGES, key);
    return { statusCode: 200, body: 'Message sent: ' + response.body };
};
