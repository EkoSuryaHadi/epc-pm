'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { createApiMethods } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const projectId = params.id as string;

  useEffect(() => {
    const fetchProject = async () => {
      if (!session?.user?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const api = createApiMethods(session.user.accessToken);
        const response = await api.projects.getById(projectId);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project details',
          variant: 'destructive',
        });
        router.push('/dashboard/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [session, projectId, router, toast]);

  if (loading) {
    return (
      <div className="container max-w-7xl py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
        <p className="text-muted-foreground">
          Update project details and settings.
        </p>
      </div>

      {/* Project Form */}
      <ProjectForm initialData={project} isEdit />
    </div>
  );
}
