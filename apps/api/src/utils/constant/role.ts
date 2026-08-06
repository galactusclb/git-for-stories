import { Roles, User } from '@/prisma/client';

export const RoleList = Roles;
export type Role = User['role'];