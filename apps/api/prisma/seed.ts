import 'dotenv/config';

import bcrypt from 'bcrypt';

import prisma from '../src/lib/prisma/prisma.js';

async function main() {
    const passwordHash = await bcrypt.hash('password123', 12);

    const user = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            passwordHash,
            role: 'ADMIN',
        },
    });

    console.log('Seeded user:', user.email);

    const posts = [
        { title: 'Hello World', body: 'This is the first post in the scaffold.', published: true },
        {
            title: 'Getting Started',
            body: 'Learn how to build on top of this scaffold.',
            published: true,
        },
        { title: 'Draft Post', body: 'This post is not yet published.', published: false },
    ];

    for (const post of posts) {
        await prisma.post.upsert({
            where: { id: `seed-post-${post.title.toLowerCase().replace(/\s+/g, '-')}` },
            update: {},
            create: {
                id: `seed-post-${post.title.toLowerCase().replace(/\s+/g, '-')}`,
                ...post,
                authorId: user.id,
            },
        });
    }

    console.log('Seeded 3 posts');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
