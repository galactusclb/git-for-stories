import { logger } from '@/lib/logger';
import prisma, { PrismaTransactionClient } from '@/lib/prisma/prisma.ts';

type ListFilter = {
    published?: boolean;
    authorId?: string;
};

export async function findPosts(
    filter: ListFilter,
    skip: number,
    take: number,
    tx?: PrismaTransactionClient
) {
    const db = tx ?? prisma;
    logger.info('in db');
    return db.post.findMany({
        where: filter,
        include: { author: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
    });
}

export async function countPosts(filter: ListFilter, tx?: PrismaTransactionClient) {
    const db = tx ?? prisma;
    return db.post.count({ where: filter });
}

export async function findPostById(id: string, tx?: PrismaTransactionClient) {
    const db = tx ?? prisma;
    return db.post.findUnique({
        where: { id },
        include: { author: { select: { id: true, email: true } } },
    });
}

export async function createPost(
    data: { title: string; body: string; published: boolean; authorId: string },
    tx?: PrismaTransactionClient
) {
    const db = tx ?? prisma;
    return db.post.create({
        data,
        include: { author: { select: { id: true, email: true } } },
    });
}

export async function updatePost(
    id: string,
    data: { title?: string; body?: string; published?: boolean },
    tx?: PrismaTransactionClient
) {
    const db = tx ?? prisma;
    return db.post.update({
        where: { id },
        data,
        include: { author: { select: { id: true, email: true } } },
    });
}

export async function deletePost(id: string, tx?: PrismaTransactionClient) {
    const db = tx ?? prisma;
    return db.post.delete({ where: { id } });
}
