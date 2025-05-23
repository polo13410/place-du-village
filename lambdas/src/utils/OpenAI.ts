import 'dotenv/config';
import OpenAI from 'openai';
import { env } from './config';

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

export async function generateMessages(prompt: string): Promise<string> {
    console.log('Generating messages with OpenAI..');
    const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
    });
    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No content in OpenAI response');
    return content;
}
