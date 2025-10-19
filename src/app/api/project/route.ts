import { verifyBody } from "@/lib/util/api";
import { getUserServer, parseError } from "@/lib/util/server_util";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma/prisma';
import { ProjectGetRes } from "@/types/api_types";

type GetReqFull = {
  userId: string;
  projectId: string;
}

export async function GET(request: Request) {
  try {
	  // User
    const {supabase, user, error: user_error} = await getUserServer(request);
    if (user_error) return user_error;
    
    // Data
    const { searchParams } = new URL(request.url);
    const SPProjectId = searchParams.get('projectId') || '';

    const props = { userId: user.id, projectId: SPProjectId };
    const props_error = verifyBody<GetReqFull>(props, 'api/project get');
    if (props_error) return props_error;

    const { userId, projectId } = props;

    if (projectId.trim() === '') {
      console.log('api/project get error: projectId not provided');
      return NextResponse.json<ProjectGetRes>({ status: 'error', message: '' }, { status: 500 });
    }

		// Logic
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        profileId: true,
        dependencies: {
          select: {
            id: true,
            name: true,
            licenseType: true,
            accessLink: true,
            projectId: true,
            createdAt: true,
            updatedAt: true,
            lastCheckAt: true,
          }
        },
      }
    });
    if (!project) {
      console.log(`api/project get error: prisma fail`);
      return NextResponse.json<ProjectGetRes>({ status: 'error', message: 'That project does not exist' }, { status: 500 });
    }
    if (project.profileId != userId) {
      return NextResponse.json<ProjectGetRes>({status: 'error', message: 'You do not have access to this project'}, { status: 401});
    }
		
		return NextResponse.json<ProjectGetRes>({status: 'success', message: '', project: project});
  } catch (e: any) {
    console.log('api/project get error')
    await parseError(e.message, e.code);
    return NextResponse.json<ProjectGetRes>({status: 'error', message: 'There was an issue loading the project'}, {status: 500});
  }
}