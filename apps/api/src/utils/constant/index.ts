import { cacheConfig } from './cache';
import { RoleList } from './role';

export const constants = {
    NODE_ENV: process.env.NODE_ENV === 'production',
    PORT: process.env.WEB_APP_URL || 4000,
    auth: {
        ACCESS_SECRET: process.env.ACCESS_SECRET,
        REFRESH_SECRET: process.env.REFRESH_SECRET,
    },
    aws: {
        xray: {
            enabled: process.env.AWS_XRAY_ENABLED ?? false,
            serviceName: process.env.AWS_XRAY_SERVICE_NAME ?? 'scafold-api',
        },
    },
    message: {
        validation: {
            required: 'This field is required',
            emailInvalid: 'Please enter a valid email',
            nameTooShort: 'Name must be at least 2 characters',
        },
    },
    role: RoleList,
    cache: cacheConfig,
};
