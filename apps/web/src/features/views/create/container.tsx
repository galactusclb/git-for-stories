import PostForm from './components/post-form';

export default function CreateContainer() {
    return (
        <div className="flex flex-col gap-8 w-full">
            <div>
                <h1 className="text-3xl font-black tracking-tight">New Post</h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    Write something and share it with the world.
                </p>
            </div>
            <PostForm />
        </div>
    );
}
