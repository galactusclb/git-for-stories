import { CreateContainer } from '@/features/views/create';

export default function CreatePage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-5xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                <CreateContainer />
            </div>
        </div>
    );
}
