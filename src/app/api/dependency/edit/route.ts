import { verifyBody } from "@/lib/util/api";
import { getUserServer, parseError } from "@/lib/util/server_util";
import { NextResponse } from "next/server";
import prisma from '@/lib/prisma/prisma';
import { DefaultAPIRes } from "@/types/api_types";

type PostReqFull = {
  userId: string;
  projectId: string;
  dependencyId: string;
  name?: string;
  licenseType?: string;
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
      dependencyId: body.dependencyId,
      name: body.name,
      licenseType: body.licenseType,
      accessLink: body.accessLink,
    };
    const props_error = verifyBody<PostReqFull>(props, 'api/dependency/edit post');
    if (props_error) return props_error;

    const { userId, projectId, dependencyId, name, licenseType, accessLink } = props;

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
      return NextResponse.json<DefaultAPIRes>({status: 'error', message: 'You do not have access to this project or this project does not exist'});
    }
    
    // Update dependency
    const updateQuery: any = {};
    if (dependencyId) updateQuery.dependencyId = dependencyId;
    if (name) updateQuery.name = name;
    if (licenseType) updateQuery.licenseType = licenseType;
    if (accessLink) updateQuery.accessLink = accessLink;

    const dependency = await prisma.dependency.update({
      where: {
        id: dependencyId,
        projectId: projectId,
      },
      data: updateQuery,
      select: {
        id: true,
      }
    });

    if (!dependency) {
      return NextResponse.json<DefaultAPIRes>({ status: 'error', message: 'There was an issue editing that dependency'}, { status: 500 });
    }

		return NextResponse.json<DefaultAPIRes>({status: 'success', message: ''});
  } catch (e: any) {
    console.log('api/dependency/edit post error')
    await parseError(e.message, e.code);
    return NextResponse.json<DefaultAPIRes>({ status: 'error', message: 'There was an issue editing that dependency' }, {status: 500});
  }
}