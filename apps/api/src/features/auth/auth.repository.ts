import prisma from '@/lib/prisma/prisma.ts';

export async function findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
}

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
}

export async function findUserByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId } });
}

export async function createEmailUser(email: string, passwordHash: string) {
    return prisma.user.create({ data: { email, passwordHash } });
}

export async function upsertGoogleUser(email: string, googleId: string) {
    return prisma.user.upsert({
        where: { email },
        update: { googleId },
        create: { email, googleId },
    });
}
