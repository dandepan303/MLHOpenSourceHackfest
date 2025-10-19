'use client'
import { useAuth } from "@/components/auth/AuthProvider";
import { config } from "@/lib/config";
import { request } from "@/lib/util/api";
import { DependencyProcessPostReq, DependencyProcessPostRes } from "@/types/api_types";
import { useCallback } from "react";

export default function TestingPage() {
  const { session } = useAuth();

  const testingAPI = useCallback(() => {
    request({
      type: 'POST',
      route: `${config.app.url}/api/testing`,
      body: {},
      session: null,
    });
  }, []);

  return (
    <div className='w-full h-full flex flex-col justify-center gap-x-8'>
      <div className="flex flex-col items-center gap-y-2">
        <button onClick={testingAPI}>Testing API</button>
      </div>
    </div>
  )
}