type PostWithAuthor = {
    id: string;
    title: string;
    body: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    author?: { id: string; email: string } | null;
};

export function toPostDTO(post: PostWithAuthor) {
    return {
        id: post.id,
        title: post.title,
        body: post.body,
        published: post.published,
        authorId: post.authorId,
        author: post.author ?? undefined,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
    };
}

export type PostDTO = ReturnType<typeof toPostDTO>;
