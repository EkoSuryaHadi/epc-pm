'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createApiMethods } from '@/lib/api-client';
import Link from 'next/link';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardData {
  projects: any[];
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  overallHealth: number;
  criticalRisks: number;
}

export default function ExecutiveDashboardPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

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

        // Calculate executive metrics
        const totalProjects = projects.length;
        const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;
        const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED').length;

        let totalBudget = 0;
        let totalSpent = 0;
        let criticalRisks = 0;

        // Optimize: Fetch data in parallel for better performance
        const projectDataPromises = projects.map(async (project: any) => {
          try {
            const [costCodesRes, costEntriesRes, risksRes] = await Promise.all([
              api.cost.getCostCodes(project.id),
              api.cost.getCostEntries(project.id),
              api.risks.getAll(project.id),
            ]);

            const costCodes = Array.isArray(costCodesRes.data) ? costCodesRes.data : [];
            const costEntries = Array.isArray(costEntriesRes.data) ? costEntriesRes.data : [];
            const risks = Array.isArray(risksRes.data) ? risksRes.data : [];

            const budget = costCodes.reduce((sum: number, code: any) => sum + Number(code.budget || 0), 0);
            const spent = costEntries
              .filter((e: any) => e.entryType === 'ACTUAL')
              .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
            const critical = risks.filter((r: any) => {
              const score = (r.probability || 0) * (r.impact || 0);
              return score >= 15 && r.status !== 'CLOSED';
            }).length;

            console.log(`Project ${project.name} - Budget: ${budget}, Spent: ${spent}, Critical Risks: ${critical}`);
            return { budget, spent, critical };
          } catch (err) {
            console.error(`Error fetching data for project ${project.id}:`, err);
            return { budget: 0, spent: 0, critical: 0 };
          }
        });

        // Wait for all project data
        const projectData = await Promise.all(projectDataPromises);
        
        // Aggregate results
        projectData.forEach(({ budget, spent, critical }) => {
          totalBudget += budget;
          totalSpent += spent;
          criticalRisks += critical;
        });

        // Calculate overall health (0-100)
        const budgetHealth = totalBudget > 0 ? Math.min(100, ((totalBudget - totalSpent) / totalBudget) * 100) : 100;
        const projectHealth = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
        const riskHealth = Math.max(0, 100 - (criticalRisks * 10));
        const overallHealth = (budgetHealth * 0.4 + projectHealth * 0.3 + riskHealth * 0.3);

        setDashboardData({
          projects,
          totalProjects,
          activeProjects,
          completedProjects,
          totalBudget,
          totalSpent,
          overallHealth,
          criticalRisks,
        });
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load dashboard data',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, toast]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Health Score Skeleton */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="flex justify-between">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-full bg-gray-200 rounded-full animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border p-6 space-y-3">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-64 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground">
              Unable to load dashboard data. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const variance = dashboardData.totalBudget - dashboardData.totalSpent;
  const variancePercent = dashboardData.totalBudget > 0 
    ? (variance / dashboardData.totalBudget) * 100 
    : 0;

  // Prepare chart data
  const projectStatusData = [
    { name: 'Active', value: dashboardData.activeProjects, color: '#3b82f6' },
    { name: 'Completed', value: dashboardData.completedProjects, color: '#10b981' },
    { name: 'Other', value: dashboardData.totalProjects - dashboardData.activeProjects - dashboardData.completedProjects, color: '#6b7280' },
  ].filter(item => item.value > 0);

  // Budget chart data - handle both under and over budget scenarios
  const budgetData = dashboardData.totalBudget > 0 ? [
    { name: 'Spent', value: dashboardData.totalSpent, color: variance >= 0 ? '#3b82f6' : '#ef4444' },
    { name: variance >= 0 ? 'Remaining' : 'Over Budget', value: Math.abs(variance), color: variance >= 0 ? '#10b981' : '#f59e0b' },
  ].filter(item => item.value > 0) : [];

  // Health score color
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-blue-50';
    if (score >= 40) return 'bg-amber-50';
    return 'bg-red-50';
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Portfolio overview and key performance indicators
        </p>
        {dashboardData.totalBudget === 0 && dashboardData.totalProjects > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <strong>Note:</strong> No budget data found. Please add Cost Codes and budgets to your projects to see financial metrics.
          </div>
        )}
      </div>

      {/* Health Score */}
      <Card className={getHealthBg(dashboardData.overallHealth)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Portfolio Health Score</span>
            <span className={`text-4xl font-bold ${getHealthColor(dashboardData.overallHealth)}`}>
              {dashboardData.overallHealth.toFixed(0)}
            </span>
          </CardTitle>
          <CardDescription>
            Overall health based on budget, progress, and risk factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                dashboardData.overallHealth >= 80 ? 'bg-green-600' :
                dashboardData.overallHealth >= 60 ? 'bg-blue-600' :
                dashboardData.overallHealth >= 40 ? 'bg-amber-600' :
                'bg-red-600'
              }`}
              style={{ width: `${dashboardData.overallHealth}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-muted-foreground">Budget Health</p>
              <p className="text-lg font-semibold">
                {variance >= 0 ? 'Under Budget' : 'Over Budget'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Project Progress</p>
              <p className="text-lg font-semibold">
                {dashboardData.completedProjects}/{dashboardData.totalProjects} Complete
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Critical Risks</p>
              <p className="text-lg font-semibold">
                {dashboardData.criticalRisks} Active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.activeProjects} active, {dashboardData.completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(dashboardData.totalBudget / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(dashboardData.totalSpent / 1000000).toFixed(1)}M
            </div>
            <p className={`text-xs mt-1 flex items-center gap-1 ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {variance >= 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {Math.abs(variancePercent).toFixed(1)}% {variance >= 0 ? 'under' : 'over'} budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.criticalRisks}</div>
            <p className={`text-xs mt-1 ${dashboardData.criticalRisks > 5 ? 'text-red-600' : 'text-green-600'}`}>
              {dashboardData.criticalRisks > 5 ? 'Attention needed' : 'Under control'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Current project portfolio breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Total portfolio budget allocation</CardDescription>
          </CardHeader>
          <CardContent>
            {budgetData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${(value / 1000000).toFixed(1)}M`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No budget data available</p>
                  <p className="text-xs mt-1">Add projects with budgets to see this chart</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Quick overview of all active projects</CardDescription>
            </div>
            <Link href="/dashboard/projects">
              <Button variant="outline">View All Projects</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.projects.filter(p => p.status === 'ACTIVE').slice(0, 5).map((project: any) => (
              <div key={project.id} className="flex items-center justify-between border-b pb-4 last:border-0 hover:bg-gray-50 -mx-6 px-6 py-4 transition-colors">
                <div className="flex-1">
                  <Link href={`/dashboard/projects/${project.id}/dashboard`}>
                    <h4 className="font-semibold hover:text-blue-600 transition-colors">{project.name}</h4>
                  </Link>
                  <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm font-medium">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <p className="text-sm font-medium">
                      {new Date(project.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/dashboard/projects/${project.id}/dashboard`}>
                    <Button size="sm" className="whitespace-nowrap">View Details</Button>
                  </Link>
                </div>
              </div>
            ))}
            {dashboardData.activeProjects === 0 && (
              <div className="text-center py-12">
                <div className="rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-muted-foreground font-medium">No active projects</p>
                <p className="text-sm text-muted-foreground mt-1">Create a new project to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
