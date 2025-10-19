import { verifyBody } from "@/lib/util/api";
import { getUserServer, parseError } from "@/lib/util/server_util";
import { DefaultAPIRes } from "@/types/api_types";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma/prisma';

type PostReqFull = {
  userId: string;
  projectId: string;
  name: string;
  licenseType: string;
  accessLink?: string;
}

export async function POST(request: Request) {
  try {
	  // User
    const {supabase, user, error: user_error} = await getUserServer(request);
    if (user_error) return user_error;
    
    // Data
    const body = await request.json();

    const props: PostReqFull = {
      userId: user.id,
      projectId: body.projectId,
      name: body.name,
      licenseType: body.licenseType,
      accessLink: body.accessLink,
    };
    const props_error = verifyBody<PostReqFull>(props, 'api/dependency/create post');
    if (props_error) return props_error;

    const { userId, projectId, name, licenseType, accessLink } = props;

    // Logic
    // Ensure user has access to project
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        profileId: userId,
      },
      select: {
        id: true,
      }
    });
    if (!project) {
      return NextResponse.json<DefaultAPIRes>({status: 'error', message: 'You do not have access to edit this project or this project does not exist'});
    }

    // Check if dependency already exists
    const existingDependency = await prisma.dependency.findUnique({
      where: {
        name: name,
      },
      select: {
        id: true,
      }
    });

    if (existingDependency) {
      // If existing dependencies -> link project & dependencies
      await prisma.project.update({
        where: { id: projectId },
        data: {
          dependencies: {
            connect: { id: existingDependency.id }
          }
        }
      });
    } else {
      // If no existing depdency -> Create dependency & link to project
      const createQuery: any = {
        projectId: projectId,
        name: name,
        licenseType: licenseType,
      }
      if (accessLink) createQuery.accessLink = accessLink;
  
      const dependency = await prisma.dependency.create({
        data: createQuery,
        select: {
          id: true,
        }
      });
      if (!dependency) {
        return NextResponse.json<DefaultAPIRes>({ status: 'error', message: 'There was an issue creating the dependency'}, { status: 500 });
      }
    }

		return NextResponse.json<DefaultAPIRes>({status: 'success', message: ''});
  } catch (e: any) {
    console.log('api/dependency/create post error')
    await parseError(e.message, e.code);
    return NextResponse.json<DefaultAPIRes>({status: 'error', message: 'There was an issue creating the dependency'}, {status: 500});
  }
}