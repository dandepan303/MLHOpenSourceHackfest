import { Chat, Dependency, Message, Profile, Project, UserRole } from "@/lib/generated/prisma/prisma";

export type RelationProfile = Profile & {
  projects?: RelationProject[];
}

export type RelationProject = Project & {
  dependencies?: RelationDependency[];
  profile?: RelationProfile;
}

export type RelationDependency = Dependency & {
  project?: RelationProject;
}

export type RelationChat = Chat & {
  message?: RelationMessage[]
}

export type RelationMessage = Message & {}

export type StrUserRole = 'ADMIN' | 'USER' | 'GUEST';

export function strUserRoleToUserRole(strRole: StrUserRole): UserRole {
  switch (strRole) {
    case 'ADMIN':
      return UserRole.ADMIN;
    case 'USER':
      return UserRole.USER;
    case 'GUEST':
      return UserRole.GUEST;
    default:
      throw new Error(`Invalid StrUserRole: ${strRole}`);
  }
}

export function userRoleToStrUserRole(userRole: UserRole): StrUserRole {
  switch (userRole) {
    case UserRole.ADMIN:
      return 'ADMIN';
    case UserRole.USER:
      return 'USER';
    case UserRole.GUEST:
      return 'GUEST';
    default:
      throw new Error(`Invalid UserRole: ${userRole}`);
  }
}