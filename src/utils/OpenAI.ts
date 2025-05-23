import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateMessages(prompt: string): Promise<string> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
    });
    return response.choices[0]?.message?.content || '';
}
