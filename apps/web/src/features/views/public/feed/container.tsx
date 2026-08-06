import FeedSection from './components/feed-section';

export default function FeedContainer() {
    return (
        <div className="flex flex-col w-full gap-8">
            <div>
                <h1 className="text-4xl font-black tracking-tight">Posts</h1>
                <p className="mt-2 text-muted-foreground">Read and share with the community.</p>
            </div>
            <FeedSection />
        </div>
    );
}
