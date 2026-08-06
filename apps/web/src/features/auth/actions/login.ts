'use server';

export type LoginState = {
    success: boolean;
    message?: string;
    error?: string;
};

export default async function loginAction(
    _prevState: LoginState,
    _formData: FormData
): Promise<LoginState> {
    return { success: false, message: 'Use Google OAuth to sign in.' };
}
