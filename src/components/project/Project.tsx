'use client'
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useSearchParams } from "next/navigation";
import { request } from "@/lib/util/api";
import { DefaultAPIRes, DependencyLinkPostReq, DependencyDeletePostReq, DependencyEditPostReq, DependencyProcessPostReq, DependencyProcessPostRes, ProjectCreatePostReq, ProjectCreatePostRes, ProjectGetRes } from "@/types/api_types";
import { config } from "@/lib/config";
import {supabase} from '@/lib/supabase/client';
import { useProtectorAuth } from "../auth/AuthProtector";
import axios from "axios";
import { RelationDependency, RelationProject } from "@/types/types";
import Loading from "../ui/Loading";
import UploadDependencies from "../UploadDependencies";
import UploadDependenciesComponent from "../UploadDependencies";
import DependencyComponent from "./Dependency";
import { useRouter } from "next/navigation";
import { useNotification } from "../ui/Notification";

export interface DependencyChangeData {
  changeType: 'create' | 'edit' | 'delete';
  id: string;
  name: string;
  licenseType: string;
}

export default function ProjectComponent() {
  const router = useRouter();
  const { addNotification, addNotificationStatus } = useNotification();

  const { user, session } = useAuth();
  const { requireAuth } = useProtectorAuth();
  const searchParams = useSearchParams();

  const [state, setState] = useState<'null' | 'page-loading' | 'saving-data' | 'processing-data'>('page-loading');

  const projectId = useRef<string | null>(searchParams.get('projectId') || null);
  const [project, setProject] = useState<RelationProject | null>(null);
  const [dependencies, setDependencies] = useState<Record<string, RelationDependency>>({}); // Dependency id to displayed dependency

  const loadTimeout = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(() => {
    // Clear any existing timeout first
    if (loadTimeout.current) {
      clearTimeout(loadTimeout.current);
      loadTimeout.current = setTimeout(() => {
        loadData();
      }, 10000);
    }

    async function exec() {
      if (session.loading || !projectId) return;

      try {
        const res = await request<ProjectGetRes>({
          type: 'GET',
          route: `${config.app.url}/api/project?projectId=${projectId.current}`,
          body: {},
          session: session.data,
        });

        if (res.status === 'success' && res.project) {
          projectId.current = res.project.id;
          setProject(res.project);
          if (res.project.dependencies) {
            setDependencies(Object.fromEntries(res.project.dependencies.map(dep => [dep.id, dep])));
            console.log('LOAD DATA FORMATED DATA', res.project.dependencies);
          }
        }
      } catch (e: any) {
        console.log(`components/project/projectComponent loadData error: ${e.message}`);
      }
    }
    exec();
  }, [session.loading, projectId, session.data, setProject, setDependencies]);

  // Add this useEffect to start the loading cycle and cleanup
  useEffect(() => {
    loadData();

    return () => {
      if (loadTimeout.current) {
        clearTimeout(loadTimeout.current);
        loadTimeout.current = null;
      }
    };
  }, [loadData]);

  const saveChanges = useCallback((changes: DependencyChangeData[]) => {
    async function exec() {
      try {
        setState('saving-data');

        const projId = projectId.current;
        if (!projId) {
          requireAuth();
          return;
        };

        const savePromises = changes.map(change => {
          let promise;

          if (change.changeType === 'create') {
            const createBody: DependencyLinkPostReq = {
              projectId: projId,
              name: change.name,
              licenseType: change.licenseType || 'Unknown - potentially private/internal',
            }
            // if (dep.accessLink) createBody.accessLink = dep.dependency.accessLink;

            promise = axios.post(`${config.app.url}/api/dependency/create`, createBody, {
              withCredentials: true,
              validateStatus: () => true,
              headers: session ? { Authorization: `Bearer ${session.data?.access_token}` } : undefined,
            });
          } else if (change.changeType === 'edit') {
            const editBody: DependencyEditPostReq = {
              projectId: projId,
              dependencyId: change.id,
              name: change.name,
              licenseType: change.licenseType || 'Unknown - potentially private/internal',
            }
            // if (dep.dependency.accessLink) editBody.accessLink = dep.dependency.accessLink;

            promise = axios.post(`${config.app.url}/api/dependency/edit`, editBody, {
              withCredentials: true,
              validateStatus: () => true,
              headers: session ? { Authorization: `Bearer ${session.data?.access_token}` } : undefined,
            });
          } else if (change.changeType === 'delete') {
            const deleteBody: DependencyDeletePostReq = {
              projectId: projId,
              dependencyId: change.id,
            }
            promise = promise = axios.post(`${config.app.url}/api/dependency/delete`, deleteBody, {
              withCredentials: true,
              validateStatus: () => true,
              headers: session ? { Authorization: `Bearer ${session.data?.access_token}` } : undefined,
            });
          } else {
            console.log(`components/project/projectComponent error: invalid changeType: ${change.changeType}`);
          }

          if (!promise) return null;

          return promise
            .then(response => ({
              id: change.id,
              status: response.data.status,
              changeData: change,
              data: response.data
            }))
            .catch(error => ({
              id: change.id,
              status: 'error',
              changeData: change,
              error: error.response?.data || error.message
            }));
        });

        const results = await Promise.allSettled(savePromises);

        let hasError = false;
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            const wrappedRes = result.value;
            if (wrappedRes.status === 'error') hasError = true;
          }
        });

        if (hasError) addNotification({ message: 'There was an issue saving changes', type: 'error' });
      } catch (e: any) {
        console.log(`components/project/projectComponent saveChanges error: ${e.message}`);
        addNotification({ message: 'There was an issue saving changes', type: 'error'});
      } finally {
        loadData();
        setState('null');
      }
    }
    exec();
  }, [session, projectId]);

  const processDependencies = useCallback(({ type, data }: { type: 'name' | 'link' | 'python', data: string }) => {
      if (session.loading || state != 'null' || data.trim() === '') return;
      try {
        async function exec() {
          setState('processing-data');
          addNotification({ message: 'Processing dependencies... This may take while' });

          // Get dependency license data: type & text
          const body: DependencyProcessPostReq = {
            dependencies: data.split('\n').map(line => {
              return { dataType: type, data: line.trim() }
            })
          }
          const res = await request<DependencyProcessPostRes>({
            type: 'POST',
            route: `${config.app.url}/api/dependency/process`,
            body: body,
            session: session.data,
          });

          addNotificationStatus(res);
          if (res.status === 'error' || !res.licenseDatas) {
            setState('null');
            return;
          }

          // Save changes
          saveChanges(res.licenseDatas.map(licenseData => {
            return {
              changeType: 'create',
              id: '',
              name: licenseData.depName,
              licenseType: licenseData.type,
            };
          }));
        }
        exec();
      } catch (e: any) {
        console.log(`components/project/projectComponent processDependencies error: ${e.message}`);
      }
    }, [setState, session, state, saveChanges, config.app.url, request]
  );
  
  useEffect(() => {
    async function exec() {
      try {
        if (session.loading || user.loading) return;

        if (projectId.current) {
          // If project id exists
          if (!user.data?.id) {
            // If user doesn't exist, require authentication bf accessing data
            requireAuth();
          } else {
            loadData();
          }
        } else {
          // If project id doesn't exist
          if (user.data?.id) {
            // If user, create project under user
            setState('saving-data');

            const body: ProjectCreatePostReq = { name: 'New Project' }

            const res = await request<ProjectCreatePostRes>({
              type: 'POST',
              route: `${config.app.url}/api/project/create`,
              body: body,
              session: session.data,
            });

            addNotificationStatus(res);
            console.log(`notification: ${res.message}`);
            if (res.status === 'success' && res.projectId) {
              // Update page query so that refresh stays on this project
              const params = new URLSearchParams(searchParams.toString())
              params.set('projectId', res.projectId);
              router.push(`?${params.toString()}`);

              // Update internal states
              projectId.current = res.projectId;
              loadData();
            }
          }
        }
      } catch (e: any) {
        console.log(`components/project/projectComponent useEffect error: ${e.message}`);
      } finally {
        setState('null');
      }
    }
    exec();
  }, [session.loading, user.loading, user.data?.id, setState, setDependencies]);

  if (state === 'page-loading') {
    return <Loading/>
  }
  return (
    <div className='w-full h-full flex flex-col justify-center items-center' style={{ backgroundColor: '#EEECDA' }}>
      <div className='w-2/3 h-full'>
        <UploadDependenciesComponent processDependencies={processDependencies} state={state}></UploadDependenciesComponent>

        {Object.entries(dependencies).map(([id, dependency]) => (
          <DependencyComponent
            key={id}
            dependency={dependency}
            saveChanges={saveChanges}
          />
        ))}
      </div>
    </div>
  )

}