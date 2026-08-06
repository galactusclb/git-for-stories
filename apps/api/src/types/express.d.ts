import { Role } from '@/utils/constant/role';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: Role;
            };
            // Populated by validate middleware
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validatedBody?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validatedQuery?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validatedParams?: any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validatedHeaders?: any;
        }
    }
}

export {};
