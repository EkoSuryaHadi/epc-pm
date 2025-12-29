'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ModernCard, GradientCard } from '@/components/ui/modern-card';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Briefcase,
  Target,
  Activity
} from 'lucide-react';
import { createApiMethods } from '@/lib/api-client';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ec4899'];

export default function ModernExecutivePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

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

        const totalProjects = projects.length;
        const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;
        const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED').length;

        let totalBudget = 0;
        let totalSpent = 0;
        let criticalRisks = 0;

        const projectDataPromises = projects.map(async (project: any) => {
          try {
            const [costCodesRes, costEntriesRes, risksRes] = await Promise.all([
              api.cost.getCostCodes(project.id).catch(() => ({ data: [] })),
              api.cost.getCostEntries(project.id).catch(() => ({ data: [] })),
              api.risks.getAll(project.id).catch(() => ({ data: [] })),
            ]);

            const budget = (costCodesRes.data || []).reduce((sum: number, code: any) => sum + Number(code.budget || 0), 0);
            const spent = (costEntriesRes.data || [])
              .filter((e: any) => e.entryType === 'ACTUAL')
              .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);
            const critical = (risksRes.data || []).filter((r: any) => {
              const score = (r.probability || 0) * (r.impact || 0);
              return score >= 15 && r.status !== 'CLOSED';
            }).length;

            return { budget, spent, critical };
          } catch {
            return { budget: 0, spent: 0, critical: 0 };
          }
        });

        const projectStats = await Promise.all(projectDataPromises);
        projectStats.forEach(({ budget, spent, critical }) => {
          totalBudget += budget;
          totalSpent += spent;
          criticalRisks += critical;
        });

        const overallHealth = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 100;

        // Mock chart data
        const monthlyData = [
          { month: 'Jan', planned: 400, actual: 380 },
          { month: 'Feb', planned: 450, actual: 420 },
          { month: 'Mar', planned: 500, actual: 490 },
          { month: 'Apr', planned: 550, actual: 530 },
          { month: 'May', planned: 600, actual: 610 },
          { month: 'Jun', planned: 650, actual: 640 },
        ];

        const projectStatusData = [
          { name: 'Active', value: activeProjects },
          { name: 'Completed', value: completedProjects },
          { name: 'Planning', value: totalProjects - activeProjects - completedProjects },
        ];

        setDashboardData({
          totalProjects,
          activeProjects,
          completedProjects,
          totalBudget,
          totalSpent,
          overallHealth,
          criticalRisks,
          monthlyData,
          projectStatusData,
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 w-64 bg-white/50 rounded-lg animate-pulse" />
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const data = dashboardData || {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    totalSpent: 0,
    overallHealth: 0,
    criticalRisks: 0,
    monthlyData: [],
    projectStatusData: [],
  };

  const budgetUtilization = data.totalBudget > 0 
    ? Math.round((data.totalSpent / data.totalBudget) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
            Executive Dashboard
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            High-level portfolio overview and key performance indicators
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ModernCard
            title="Total Projects"
            value={data.totalProjects}
            subtitle={`${data.activeProjects} active`}
            icon={Briefcase}
            gradient="blue"
          />
          <ModernCard
            title="Budget Utilization"
            value={`${budgetUtilization}%`}
            subtitle={`$${(data.totalSpent / 1000000).toFixed(1)}M spent`}
            icon={DollarSign}
            gradient="green"
            trend={{ value: "5%", isPositive: budgetUtilization < 90 }}
          />
          <ModernCard
            title="Overall Health"
            value={`${data.overallHealth}%`}
            subtitle="Portfolio performance"
            icon={Activity}
            gradient="purple"
            trend={{ value: "8%", isPositive: true }}
          />
          <ModernCard
            title="Critical Risks"
            value={data.criticalRisks}
            subtitle="Require attention"
            icon={AlertTriangle}
            gradient={data.criticalRisks > 5 ? "orange" : "blue"}
            trend={{ value: "2", isPositive: false }}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Budget Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Budget Trend</h3>
              <p className="text-sm text-gray-500 mt-1">Planned vs Actual ($K)</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.monthlyData}>
                <defs>
                  <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="planned" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPlanned)" strokeWidth={2} />
                <Area type="monotone" dataKey="actual" stroke="#10b981" fillOpacity={1} fill="url(#colorActual)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Project Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Project Status</h3>
              <p className="text-sm text-gray-500 mt-1">Distribution by status</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.projectStatusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Performance Summary */}
        <div className="grid gap-6 lg:grid-cols-3">
          <GradientCard gradient="blue">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Completed Projects</p>
                <h3 className="text-4xl font-bold text-white">{data.completedProjects}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-white/90 text-sm">
              Successfully delivered projects
            </p>
          </GradientCard>

          <GradientCard gradient="green">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">On Schedule</p>
                <h3 className="text-4xl font-bold text-white">{data.activeProjects}</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-white/90 text-sm">
              Projects meeting deadlines
            </p>
          </GradientCard>

          <GradientCard gradient="purple">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Performance</p>
                <h3 className="text-4xl font-bold text-white">{data.overallHealth}%</h3>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-white/90 text-sm">
              Overall portfolio health score
            </p>
          </GradientCard>
        </div>
      </div>
    </div>
  );
}
