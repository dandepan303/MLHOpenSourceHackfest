'use client'
import { useAuth } from "@/components/auth/AuthProvider";
import ProjectComponent from "@/components/project/Project";
import { config } from "@/lib/config";
import { request } from "@/lib/util/api";
import { DependencyProcessPostReq, DependencyProcessPostRes } from "@/types/api_types";
import Image from "next/image";
import { useEffect } from "react";

export default function HomePage() {
  return (
    <div className='flex w-full h-full justify-center items-center'>
      <ProjectComponent></ProjectComponent>
    </div>
  );
}
