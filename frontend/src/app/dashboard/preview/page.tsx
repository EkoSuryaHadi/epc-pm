'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ModernCard, GradientCard } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { 
  Folder, 
  DollarSign, 
  Calendar, 
  FileText, 
  TrendingUp, 
  ArrowRight,
  AlertTriangle,
  Activity,
  Zap,
  ChevronRight,
  Sparkles,
  Eye
} from 'lucide-react';
import { createApiMethods } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function PreviewDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
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

        // Aggregate stats
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Skeleton loading */}
          <div className="space-y-2">
            <div className="h-10 w-64 bg-white/50 rounded-lg animate-pulse" />
            <div className="h-6 w-96 bg-white/50 rounded-lg animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Preview Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Preview Mode
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                </h2>
                <p className="text-white/90">You&apos;re viewing the NEW modern dashboard design</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                View Old Design
              </Button>
              <Button
                onClick={() => router.push('/dashboard/comparison')}
                className="bg-white hover:bg-gray-100 text-purple-600"
              >
                Compare Side-by-Side
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
            Welcome back, {session?.user?.name || 'User'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap gap-3"
        >
          <Link href="/dashboard/executive">
            <Button size="lg" className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-primary">
              <TrendingUp className="h-4 w-4 mr-2" />
              Executive Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/projects">
            <Button size="lg" variant="outline" className="border-2 hover:bg-primary-50">
              <Folder className="h-4 w-4 mr-2" />
              View All Projects
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ModernCard
            title="Total Projects"
            value={stats.totalProjects}
            subtitle={`${stats.activeProjects} active projects`}
            icon={Folder}
            gradient="blue"
            trend={{
              value: "12%",
              isPositive: true
            }}
          />
          
          <ModernCard
            title="Total Budget"
            value={`$${(stats.totalBudget / 1000000).toFixed(1)}M`}
            subtitle="Across all projects"
            icon={DollarSign}
            gradient="green"
            trend={{
              value: "8%",
              isPositive: true
            }}
          />
          
          <ModernCard
            title="Schedule Tasks"
            value={stats.totalTasks}
            subtitle="Total tasks tracked"
            icon={Calendar}
            gradient="purple"
          />
          
          <ModernCard
            title="Documents"
            value={stats.totalDocuments}
            subtitle="Total files managed"
            icon={FileText}
            gradient="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Projects - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
                <p className="text-sm text-gray-500 mt-1">Your active project portfolio</p>
              </div>
              <Link href="/dashboard/projects">
                <Button variant="ghost" className="group">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            {recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map((project: any, index: number) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                  >
                    <Link 
                      href={`/dashboard/projects/${project.id}/dashboard`}
                      className="block group"
                    >
                      <div className="p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                              {project.name}
                              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {project.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${(project.totalBudget / 1000000).toFixed(1)}M
                              </span>
                              <span className="text-xs text-gray-400">{project.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Folder className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-4">No projects yet</p>
                <Link href="/dashboard/projects">
                  <Button variant="outline">
                    Create your first project
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Risks Card */}
            <GradientCard gradient={stats.openRisks > 10 ? 'orange' : 'blue'}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Open Risks</p>
                  <h3 className="text-4xl font-bold text-white">{stats.openRisks}</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-white/90 text-sm mb-4">
                Across all active projects
              </p>
              <Link href="/dashboard/projects">
                <Button variant="secondary" size="sm" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                  Review Risks
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </GradientCard>

            {/* Activity Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Stats</h3>
                  <p className="text-xs text-gray-500">System overview</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <span className="text-sm text-gray-600">Active Projects</span>
                  <span className="font-semibold text-blue-600">{stats.activeProjects}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <span className="font-semibold text-green-600">{stats.totalTasks}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                  <span className="text-sm text-gray-600">Documents</span>
                  <span className="font-semibold text-orange-600">{stats.totalDocuments}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GradientCard gradient="purple" className="relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-300" />
                    <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Pro Tip</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Streamline your workflow with Reports
                  </h3>
                  <p className="text-white/90 mb-4">
                    Generate comprehensive PDF and Excel reports with just a few clicks
                  </p>
                  <Link href="/dashboard/reports">
                    <Button variant="secondary" className="bg-white hover:bg-gray-100 text-purple-600">
                      Go to Reports
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </GradientCard>
        </motion.div>
      </div>
    </div>
  );
}
