'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Calendar, DollarSign } from 'lucide-react';
import { createApiMethods } from '@/lib/api-client';
import { format } from 'date-fns';

interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  location?: string;
  client?: string;
  status: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  currency: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PLANNING: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!session?.user?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const api = createApiMethods(session.user.accessToken);
        const response = await api.projects.getAll();
        setProjects(response.data);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [session]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-600 mt-1">Manage all your EPC projects</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects ({projects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading projects...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium mb-2">No projects yet</p>
              <p className="text-sm mb-4">
                Click &quot;New Project&quot; to create your first project.
              </p>
              <Link href="/dashboard/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500">
                            {project.code}
                          </span>
                          <Badge className={statusColors[project.status]}>
                            {project.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      {project.location && (
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium w-20">Location:</span>
                          <span>{project.location}</span>
                        </div>
                      )}
                      
                      {project.client && (
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium w-20">Client:</span>
                          <span>{project.client}</span>
                        </div>
                      )}

                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {format(new Date(project.startDate), 'MMM dd, yyyy')} -{' '}
                          {format(new Date(project.endDate), 'MMM dd, yyyy')}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span className="font-semibold">
                          {formatCurrency(project.totalBudget, project.currency)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t space-y-2">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/projects/${project.id}/wbs`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            WBS
                          </Button>
                        </Link>
                        <Link href={`/dashboard/projects/${project.id}/cost-codes`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Cost Codes
                          </Button>
                        </Link>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/projects/${project.id}/cost-entries`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Cost Entries
                          </Button>
                        </Link>
                        <Link href={`/dashboard/projects/${project.id}/cost-analysis`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Cost Analysis
                          </Button>
                        </Link>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/projects/${project.id}/schedule`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Schedule
                          </Button>
                        </Link>
                        <Link href={`/dashboard/projects/${project.id}/gantt`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Gantt Chart
                          </Button>
                        </Link>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/projects/${project.id}/milestones`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Milestones
                          </Button>
                        </Link>
                        <Link href={`/dashboard/projects/${project.id}/dashboard`} className="flex-1">
                          <Button variant="default" size="sm" className="w-full">
                            Dashboard
                          </Button>
                        </Link>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/projects/${project.id}/progress`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Progress
                          </Button>
                        </Link>
                        <Link href={`/dashboard/projects/${project.id}/evm`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            EVM
                          </Button>
                        </Link>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/projects/${project.id}/documents`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Documents
                          </Button>
                        </Link>
                        <Link href={`/dashboard/projects/${project.id}/risks`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Risks
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
