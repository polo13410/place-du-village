import "dotenv/config";
export const env = {
    AWS_REGION: process.env.AWS_REGION || 'eu-west-1',
    STAGE: process.env.STAGE!,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    WHATSAPP_GROUP_ID: process.env.WHATSAPP_GROUP_ID!,
    S3_BUCKET_MESSAGES: process.env.S3_BUCKET_MESSAGES!,
};