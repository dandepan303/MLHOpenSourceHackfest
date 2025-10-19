import { verifyBody } from "@/lib/util/api";
import { getUserServer, parseError } from "@/lib/util/server_util";
import { ProjectCreatePostRes } from "@/types/api_types";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma/prisma';

type PostReqFull = {
  userId: string;
  name: string;
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
      name: body.name,
    };
    const props_error = verifyBody<PostReqFull>(props, 'api/project/create post');
    if (props_error) return props_error;

    const { userId, name } = props;

		// Logic
    const project = await prisma.project.create({
      data: {
        name: name,
        profileId: userId,
      },
      select: {
        id: true,
      }
    });

    if (!project) {
      return NextResponse.json<ProjectCreatePostRes>({ status: 'error', message: 'There was an issue creating the project'}, { status: 500 });
    }

		return NextResponse.json<ProjectCreatePostRes>({status: 'success', message: '', projectId: project.id});
  } catch (e: any) {
    console.log('api/project/create post error')
    await parseError(e.message, e.code);
    return NextResponse.json<ProjectCreatePostRes>({status: 'error', message: 'There was an issue creating the project'}, {status: 500});
  }
}