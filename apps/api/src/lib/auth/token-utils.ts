import crypto from 'crypto';

export function randomToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('base64url');
}

export function sha256Hex(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
}

export function pkceCodeChallengeS256(verifier: string): string {
    const digest = crypto.createHash('sha256').update(verifier).digest();
    return Buffer.from(digest).toString('base64url');
}
