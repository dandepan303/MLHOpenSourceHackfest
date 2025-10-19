import { verifyBody } from "@/lib/util/api";
import { getUserServer, parseError } from "@/lib/util/server_util";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma/prisma';
import { DefaultAPIRes } from "@/types/api_types";

type PostReqFull = {
  userId: string;
  projectId: string;
  name?: string;
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
    };
    const props_error = verifyBody<PostReqFull>(props, 'api/project/edit post');
    if (props_error) return props_error;

    const { userId, projectId, name } = props;

		// Logic
    
    const updateQuery: any = {};
    if (name) updateQuery.name = name;

    const project = await prisma.project.update({
      where: {
        id: projectId,
        profileId: userId,
      },
      data: updateQuery,
      select: {
        id: true,
      }
    });

    if (!project) {
      return NextResponse.json<DefaultAPIRes>({ status: 'error', message: 'There was an issue editing that project'}, { status: 500 });
    }

		return NextResponse.json<DefaultAPIRes>({status: 'success', message: ''});
  } catch (e: any) {
    console.log('api/project/edit post error')
    await parseError(e.message, e.code);
    return NextResponse.json<DefaultAPIRes>({ status: 'error', message: 'There was an issue editing that project' }, {status: 500});
  }
}