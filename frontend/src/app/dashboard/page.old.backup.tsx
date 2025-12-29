'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, DollarSign, Calendar, FileText, Loader2, TrendingUp, ArrowRight } from 'lucide-react';
import { createApiMethods } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    totalTasks: 0,
    totalDocuments: 0,
    openRisks: 0,
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const api = createApiMethods(session.user.accessToken);
        const projectsRes = await api.projects.getAll();
        const projects = projectsRes.data;

        const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE');
        setRecentProjects(projects.slice(0, 5));

        // Aggregate stats from all projects
        let totalBudget = 0;
        let totalTasks = 0;
        let totalDocuments = 0;
        let openRisks = 0;

        const statsPromises = projects.map(async (project: any) => {
          try {
            const [costRes, scheduleRes, docsRes, risksRes] = await Promise.all([
              api.cost.getCostCodes(project.id).catch(() => ({ data: [] })),
              api.schedule.getAll(project.id).catch(() => ({ data: [] })),
              api.documents.getAll(project.id).catch(() => ({ data: [] })),
              api.risks.getAll(project.id).catch(() => ({ data: [] })),
            ]);

            return {
              budget: costRes.data.reduce((sum: number, c: any) => sum + Number(c.budget), 0),
              tasks: scheduleRes.data.length,
              documents: docsRes.data.length,
              risks: risksRes.data.filter((r: any) => r.status !== 'CLOSED').length,
            };
          } catch {
            return { budget: 0, tasks: 0, documents: 0, risks: 0 };
          }
        });

        const projectStats = await Promise.all(statsPromises);
        projectStats.forEach(({ budget, tasks, documents, risks }) => {
          totalBudget += budget;
          totalTasks += tasks;
          totalDocuments += documents;
          openRisks += risks;
        });

        setStats({
          totalProjects: projects.length,
          activeProjects: activeProjects.length,
          totalBudget,
          totalTasks,
          totalDocuments,
          openRisks,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border p-6 space-y-3">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to EPC Project Control</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard/executive">
          <Button variant="default">
            <TrendingUp className="h-4 w-4 mr-2" />
            Executive Dashboard
          </Button>
        </Link>
        <Link href="/dashboard/projects">
          <Button variant="outline">
            <Folder className="h-4 w-4 mr-2" />
            View All Projects
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Folder className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-gray-600 mt-1">{stats.activeProjects} active</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalBudget / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-gray-600 mt-1">Across all projects</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Schedule Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-gray-600 mt-1">Total tasks</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-gray-600 mt-1">Total documents</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects & Open Risks */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Projects</CardTitle>
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map((project: any) => (
                  <Link 
                    key={project.id} 
                    href={`/dashboard/projects/${project.id}/dashboard`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border"
                  >
                    <h4 className="font-semibold text-sm hover:text-blue-600 transition-colors">
                      {project.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {project.description}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No projects yet</p>
                <Link href="/dashboard/projects">
                  <Button variant="link" size="sm" className="mt-2">
                    Create your first project
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Open Risks
              {stats.openRisks > 0 && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  stats.openRisks > 10 ? 'bg-red-100 text-red-700' : 
                  stats.openRisks > 5 ? 'bg-amber-100 text-amber-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {stats.openRisks}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.openRisks > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-semibold text-red-900">{stats.openRisks} Open Risks</p>
                    <p className="text-sm text-red-700 mt-1">Across all projects</p>
                  </div>
                  <Link href="/dashboard/projects">
                    <Button size="sm">Review Risks</Button>
                  </Link>
                </div>
                <p className="text-xs text-gray-500">
                  Visit individual project pages to manage risks
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No risks registered</p>
                <p className="text-xs text-gray-400 mt-1">All projects are on track</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
