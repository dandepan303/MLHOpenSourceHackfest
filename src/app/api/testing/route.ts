import { getPackageLicense } from "@/lib/dependency_processors/Python";
import { NextResponse } from "next/server";

export async function POST() {
  const licenseData = await getPackageLicense('tensorflow');

  console.log(licenseData);

  return NextResponse.json({});
}