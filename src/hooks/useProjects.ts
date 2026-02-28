import { useState, useEffect, useCallback } from 'react';
import type { Project } from '@/types';
import * as ops from '@/db/operations';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await ops.getAllProjects();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addProject = useCallback(async (project: Project) => {
    await ops.createProject(project);
    await refresh();
  }, [refresh]);

  const editProject = useCallback(async (id: string, changes: Partial<Project>) => {
    await ops.updateProject(id, changes);
    await refresh();
  }, [refresh]);

  const removeProject = useCallback(async (id: string) => {
    await ops.deleteProject(id);
    await refresh();
  }, [refresh]);

  return { projects, loading, refresh, addProject, editProject, removeProject };
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) { setProject(null); setLoading(false); return; }
    setLoading(true);
    const data = await ops.getProject(id);
    setProject(data || null);
    setLoading(false);
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  return { project, loading, refresh };
}
