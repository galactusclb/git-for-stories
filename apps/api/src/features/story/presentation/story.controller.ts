import { Request, Response } from 'express';

import { AnswerStoryQuestionUseCase } from '../application/use-cases/answer-story-question.use-case';
import { PullOutStoryUseCase } from '../application/use-cases/pullout-story.use-case';

import { SementicSearchParams, SementicSearchQuery } from './story.schema';

export class StoryController {
    constructor(
        private readonly pullOutStoryUseCase: PullOutStoryUseCase,
        private readonly answerStoryQuestionUseCase: AnswerStoryQuestionUseCase,
    ) {}

    extractScenes = async (req: Request, res: Response) => {
        const { story, title } = req.body;

        const { storyId, scenes } = await this.pullOutStoryUseCase.execute(story, title);

        res.status(202).json({ storyId, title, scenes });
    };

    sementicSearch = async (req: Request, res: Response) => {
        const { storyId } = req.validatedParams as SementicSearchParams;
        const { q: question, limit } = req.validatedQuery as SementicSearchQuery;
        console.log('question', question);

        const result = await this.answerStoryQuestionUseCase.execute(storyId, question, limit);

        if (result.status === 'reasoning_unavailable') {
            res.set('Retry-After', '5');
        }

        res.status(200).json({
            success: true,
            data: result,
        });
    };
}
