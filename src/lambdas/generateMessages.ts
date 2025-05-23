import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import { generateMessages } from '../utils/OpenAI';
import { uploadObject } from '../utils/S3';

const S3_BUCKET_MESSAGES = process.env.S3_BUCKET_MESSAGES!;
const PROMPT = `Peux tu faire une liste de 10 faux titres de vidéo porno sur un site x mais comme si le site existait à l'époque médiévale en utilisant un lexique cru, avec une annonce publique sur la place du village. 
Exemple : Oyez, oyez, bonnes gens du bourg et des masures voisines ! Troubadour pourfend le fourreau de la mécréante du village!
Réponds uniquement par une liste numérotée.`;

export const handler = async () => {
    console.log('Starting message generation process..');
    const response = await generateMessages(PROMPT);
    const messages = response.split(/\n\s*\d+\.\s/).filter(Boolean);

    if (messages[0] && /^\d+\./.test(messages[0])) {
        messages[0] = messages[0].replace(/^\d+\.\s*/, '');
    }

    console.log('Uploading messages to S3..');
    const uploads = await Promise.all(messages.map(async (msg) => {
        const key = `daily-message-${uuidv4()}`;
        await uploadObject(
            S3_BUCKET_MESSAGES,
            key,
            '',
            { 'x-amz-meta-message': encodeURIComponent(msg) }
        );
        return key;
    }));
    console.log('Process completed successfully, messages uploaded:', uploads);
    return { statusCode: 200, body: JSON.stringify({ uploaded: uploads }) };
};
