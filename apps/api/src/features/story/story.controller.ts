import { Request, Response } from 'express';

import { createLLMProvider } from '@/lib/llm/llm-provider.factory';

const provider = createLLMProvider('gemini');

const getEmeddings = async (req: Request, res: Response) => {
    const response = await provider.generate({
        instructions: 'You are a coding assistant that talks like a pirate',
        input: 'Write a one-sentence bedtime story about a unicorn.',
    });

    console.log(response);

    res.status(200).json({ success: true, data: response });
};

export default { getEmeddings };
