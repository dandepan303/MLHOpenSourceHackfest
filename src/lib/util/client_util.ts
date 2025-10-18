import { UserRole } from '@/types/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const roleHierarchy: Record<UserRole, number> = {
  ADMIN: 2,
  USER: 1,
  GUEST: 0,
};

export function isAuthorized(userRole: string | null | undefined, requiredRole: string) {
  if (!userRole) userRole = 'GUEST';

  const userRoleLevel = roleHierarchy[userRole as UserRole];
  const requiredRoleLevel = roleHierarchy[requiredRole as UserRole];

  return userRoleLevel >= requiredRoleLevel;
}