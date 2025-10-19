import { RelationProfile, RelationProject } from "./types";

export interface DefaultAPIRes {
  status: 'success' | 'error';
  message: string;
}

// AUTH
export type AuthReq = {
  userId?: string;
  email: string;
  name: string;
}

export type AuthRes = DefaultAPIRes & {
  profile?: Partial<RelationProfile>;
}


// PROFILE
export type ProfileGetRes = DefaultAPIRes & {
  profile?: Partial<RelationProfile> | null;
}

// PROJECT

export type ProjectGetRes = DefaultAPIRes & {
  project?: RelationProject;
}

export type ProjectCreatePostReq = {
  name: string;
}

export type ProjectCreatePostRes = DefaultAPIRes & {
  projectId?: string;
}

export type ProjectEditPostReq = {
  projectId: string;
  name?: string;
}

// DEPENDENCY

export type DependencyLinkPostReq = {
  projectId: string;
  name: string;
  licenseType: string;
  accessLink?: string;
}

export type DependencyEditPostReq = {
  projectId: string;
  dependencyId: string;
  name?: string;
  licenseType?: string;
  accessLink?: string;
}

export type DependencyDeletePostReq = {
  projectId: string;
  dependencyId: string;
}

export type DependencyProcessPostReq = {
  dependencies: {
    dataType: 'name' | 'link' | 'python';
    data: string;
  }[]
}

export type DependencyProcessPostRes = DefaultAPIRes & {
  licenseDatas?: {
    depName: string;
    type: string;
    text: string;
  }[]
}