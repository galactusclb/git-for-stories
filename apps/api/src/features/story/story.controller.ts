import { Request, Response } from 'express';
import OpenAI from 'openai';

const LLM_OPENAI_API_KEY = process.env.LLM_OPENAI_API_KEY;

const client = new OpenAI({
    apiKey: LLM_OPENAI_API_KEY,
});

const getEmeddings = async (req: Request, res: Response) => {
    const response = await client.responses.create({
        model: 'gpt-5.6-luna',
        instructions: 'You are a coding assistant that talks like a pirate',
        input: 'Write a one-sentence bedtime story about a unicorn.',
    });

    console.log(response);

    res.status(200).json({ success: true, data: response.output_text });
};

export default { getEmeddings };
