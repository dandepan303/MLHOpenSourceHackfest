import { NextResponse } from 'next/server';
import { parseError } from '@/lib/util/server_util';
import { AuthReq, AuthRes } from '@/types/api_types';
import { verifyBody } from '@/lib/util/api';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/prisma';

type PostReqFull = {
  userId?: string,
  email: string,
  name: string,
}

// create db user after google sign up
export async function POST(request: Request) {
  const props = await request.json();
  const body: PostReqFull = {
    userId: props.userId,
    email: props.email,
    name: props.name,
  }
  const bodyError = verifyBody<PostReqFull>(body, '/api/auth post');
  if (bodyError) return bodyError;

  const { userId, email, name } = props;
  
  const supabase = await createServerSupabaseClient();

  try {
    let createQuery: any = {
        email: email,
        name: name,
        role: 'USER'
      };
    if (userId) createQuery.id = userId;
    
    const updateQuery: any = {}
    if (!userId) updateQuery.name = name;

    const profile = await prisma.profile.upsert({
      where: {
        email: email,
      },
      create: createQuery,
      update: updateQuery,
    })

    return NextResponse.json<AuthRes>({ status: 'success', message: '', profile: profile }, { status: 200 });
  } catch (e: any) {
    console.log('api/profile post error');
    parseError(e.message, e.code);

    return NextResponse.json<AuthRes>({ status: 'error', message: 'Server error. Please refresh or try again later' }, { status: 500 });
  }
}
