import { verifyBody } from "@/lib/util/api";
import { getUserServer, parseError } from "@/lib/util/server_util";
import { DefaultAPIRes } from "@/types/api_types";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma/prisma';

type PostReqFull = {
  userId: string;
  projectId: string;
  dependencyId: string;
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
      dependencyId: body.dependencyId,
    };
    const props_error = verifyBody<PostReqFull>(props, 'api/dependency/delete post');
    if (props_error) return props_error;

    const { userId, projectId, dependencyId } = props;

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

    console.log(`DELETE ID: ${dependencyId}`);
    await prisma.dependency.delete({
      where: {
        id: dependencyId,
      }
    });
		
		return NextResponse.json<DefaultAPIRes>({status: 'success', message: ''});
  } catch (e: any) {
    console.log('api/dependency/delete post error')
    await parseError(e.message, e.code);
    return NextResponse.json<DefaultAPIRes>({status: 'error', message: 'There was an issue deleting the dependency'}, {status: 500});
  }
}