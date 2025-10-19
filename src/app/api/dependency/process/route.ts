import { getGeminiDependencyName } from "@/lib/dependency_helpers/AI";
import { processLinkDependency, processNameDependency } from "@/lib/dependency_processors/Github";
import { processPythonDependency } from "@/lib/dependency_processors/Python";
import { verifyBody } from "@/lib/util/api";
import { getUserServer, parseError } from "@/lib/util/server_util";
import { DependencyProcessPostRes } from "@/types/api_types";
import { NextResponse } from "next/server";

type PostReqFull = {
  dependencies: {
    dataType: 'name' | 'link' | 'python';
    data: string;
  }[];
}

export async function POST(request: Request) {
  try {
    // User
    const { supabase, user, error: user_error } = await getUserServer(request);
    if (user_error) return user_error;
    
    // Data
    const body = await request.json();

    const props: PostReqFull = {
      dependencies: body.dependencies,
    };
    const props_error = verifyBody<PostReqFull>(props, 'api/dependency/process post');
    if (props_error) return props_error;

    const { dependencies } = props;
    
    // Logic
    const licenseDatas: { depName: string, type: string, text: string }[] = []

    for (const dependency of dependencies) {
      let licenseData: {type: string, text: string } = { type: 'Unknown license - potentially private/internal', text: ''};

      switch (dependency.dataType) {
        case 'name':
          const nameLicenseData = await processNameDependency(dependency.data);
          if (nameLicenseData) licenseData = nameLicenseData;
          break;
        case 'link':
          const linkLicenseData = await processLinkDependency(dependency.data);
          if (linkLicenseData) licenseData = linkLicenseData;
          break;
        case 'python':
          const pythonLicenseData = await processPythonDependency(dependency.data);
          if (pythonLicenseData) licenseData = pythonLicenseData;
          break;
        default:
          console.log(`api/dependency/process post erro: unsupported data type ${dependency.dataType}`);
          break;
      }

      licenseDatas.push({
        depName: await getGeminiDependencyName(dependency.data),
        type: licenseData.type,
        text: licenseData.text,
      });
    }

		return NextResponse.json<DependencyProcessPostRes>({status: 'success', message: '', licenseDatas: licenseDatas});
  } catch (e: any) {
    console.log('api/dependency/process post error')
    await parseError(e.message, e.code);
    return NextResponse.json<DependencyProcessPostRes>({status: 'error', message: 'There was an issue determening license type'}, {status: 500});
  }
}