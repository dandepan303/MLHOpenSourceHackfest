import { verifyBody } from "@/lib/util/api";
import { getUserServer, parseError } from "@/lib/util/server_util";
import { DefaultAPIRes } from "@/types/api_types";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma/prisma';

type PostReqFull = {
  userId: string;
  projectId: string;
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
    };
    const props_error = verifyBody<PostReqFull>(props, 'api/project/delete post');
    if (props_error) return props_error;

    const { userId, projectId } = props;

		// Logic
    await prisma.project.delete({
      where: {
        id: projectId,
        profileId: userId,
      }
    });
		
		return NextResponse.json<DefaultAPIRes>({status: 'success', message: ''});
  } catch (e: any) {
    console.log('api/project/delete post error')
    await parseError(e.message, e.code);
    return NextResponse.json<DefaultAPIRes>({status: 'error', message: 'There was an issue deleting the project'}, {status: 500});
  }
}