import LoginGoogleButton from './components/login-google-button';
import LoginShell from './components/login-shell';
import { type LoginSearchParams } from './schemas/login.schema';

export default function LoginContainer({
    searchParams,
}: {
    searchParams: Promise<LoginSearchParams>;
}) {
    return (
        <LoginShell>
            <LoginGoogleButton searchParams={searchParams} />
        </LoginShell>
    );
}
