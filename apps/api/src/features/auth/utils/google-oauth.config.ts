import { discovery, Configuration } from 'openid-client';

export type GoogleOAuthConfig = {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    webAppUrl: string;
};

let cachedConfig: Configuration | null = null;

export function getGoogleOAuthConfig(): GoogleOAuthConfig {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    const missing = [
        !clientId ? 'GOOGLE_CLIENT_ID' : null,
        !clientSecret ? 'GOOGLE_CLIENT_SECRET' : null,
        !redirectUri ? 'GOOGLE_REDIRECT_URI' : null,
    ].filter(Boolean);

    if (missing.length) throw new Error(`Missing env vars: ${missing.join(', ')}`);

    return {
        clientId: clientId!,
        clientSecret: clientSecret!,
        redirectUri: redirectUri!,
        webAppUrl: process.env.WEB_APP_URL ?? 'http://localhost:3000',
    };
}

export async function getGoogleOIDCConfig(): Promise<Configuration> {
    if (cachedConfig) return cachedConfig;

    const cfg = getGoogleOAuthConfig();
    cachedConfig = await discovery(
        new URL('https://accounts.google.com'),
        cfg.clientId,
        cfg.clientSecret
    );
    return cachedConfig;
}
