'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Activity,
  Target,
  Clock,
  CheckCircle2
} from 'lucide-react';

import { KPICard } from '@/components/cost/KPICard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createApiMethods } from '@/lib/api-client';

export default function KPIDashboardPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();

  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [kpiData, setKpiData] = useState<any>(null);

  // Fetch KPI data
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.accessToken || !projectId) {
        setLoading(false);
        return;
      }

      try {
        const api = createApiMethods(session.user.accessToken);

        // Fetch project info
        const projectRes = await api.projects.getById(projectId);
        setProjectName(projectRes.data.name);

        // Fetch KPI data
        const kpiRes = await api.progress.getKPI(projectId);
        setKpiData(kpiRes.data);
      } catch (error: any) {
        console.error('Error fetching KPI data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load KPI data',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/dashboard/projects/${projectId}/dashboard`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No KPI Data Available</h3>
            <p className="text-sm text-muted-foreground">
              KPI data will be available once project progress is tracked.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/dashboard/projects/${projectId}/dashboard`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              KPI Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              {projectName} - Key Performance Indicators
            </p>
          </div>
        </div>
      </div>

      {/* Cost Performance KPIs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Cost Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Budget"
            value={`$${kpiData.totalBudget?.toLocaleString() || '0'}`}
            subtitle="Total allocated budget"
            icon={DollarSign}
            variant="default"
          />
          <KPICard
            title="Actual Cost"
            value={`$${kpiData.totalActual?.toLocaleString() || '0'}`}
            subtitle="Total spent to date"
            icon={TrendingDown}
            variant={
              kpiData.totalActual > kpiData.totalBudget ? 'danger' : 'success'
            }
          />
          <KPICard
            title="Cost Variance"
            value={`$${Math.abs(kpiData.variance || 0).toLocaleString()}`}
            subtitle={`${
              kpiData.variance >= 0 ? 'Under' : 'Over'
            } budget by ${Math.abs(kpiData.variancePercent || 0).toFixed(1)}%`}
            icon={kpiData.variance >= 0 ? TrendingUp : AlertCircle}
            variant={kpiData.variance >= 0 ? 'success' : 'danger'}
            trend={
              kpiData.variancePercent
                ? {
                    value: kpiData.variancePercent,
                    isPositive: kpiData.variance >= 0,
                  }
                : undefined
            }
          />
          <KPICard
            title="CPI"
            value={kpiData.cpi?.toFixed(2) || '0.00'}
            subtitle="Cost Performance Index"
            icon={Activity}
            variant={kpiData.cpi >= 1 ? 'success' : 'warning'}
          />
        </div>
      </div>

      {/* Schedule Performance KPIs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Schedule Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Planned Value"
            value={`$${kpiData.plannedValue?.toLocaleString() || '0'}`}
            subtitle="PV (BCWS)"
            icon={Target}
            variant="default"
          />
          <KPICard
            title="Earned Value"
            value={`$${kpiData.earnedValue?.toLocaleString() || '0'}`}
            subtitle="EV (BCWP)"
            icon={CheckCircle2}
            variant="success"
          />
          <KPICard
            title="Schedule Variance"
            value={`$${Math.abs(kpiData.scheduleVariance || 0).toLocaleString()}`}
            subtitle={`${
              kpiData.scheduleVariance >= 0 ? 'Ahead' : 'Behind'
            } schedule by ${Math.abs(kpiData.scheduleVariancePercent || 0).toFixed(1)}%`}
            icon={kpiData.scheduleVariance >= 0 ? TrendingUp : AlertCircle}
            variant={kpiData.scheduleVariance >= 0 ? 'success' : 'warning'}
          />
          <KPICard
            title="SPI"
            value={kpiData.spi?.toFixed(2) || '0.00'}
            subtitle="Schedule Performance Index"
            icon={Clock}
            variant={kpiData.spi >= 1 ? 'success' : 'warning'}
          />
        </div>
      </div>

      {/* Project Progress */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Project Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Overall Progress"
            value={`${(kpiData.overallProgress || 0).toFixed(1)}%`}
            subtitle="Physical completion"
            icon={Activity}
            variant={
              kpiData.overallProgress >= 75
                ? 'success'
                : kpiData.overallProgress >= 50
                ? 'warning'
                : 'danger'
            }
          />
          <KPICard
            title="Tasks Completed"
            value={`${kpiData.completedTasks || 0}/${kpiData.totalTasks || 0}`}
            subtitle="Tasks status"
            icon={CheckCircle2}
            variant="success"
          />
          <KPICard
            title="On Time Delivery"
            value={`${(kpiData.onTimePercent || 0).toFixed(1)}%`}
            subtitle="Tasks completed on time"
            icon={Clock}
            variant={
              kpiData.onTimePercent >= 90
                ? 'success'
                : kpiData.onTimePercent >= 70
                ? 'warning'
                : 'danger'
            }
          />
        </div>
      </div>

      {/* Risk & Change KPIs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Risk & Change Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Active Risks"
            value={kpiData.activeRisks || 0}
            subtitle="Risks being managed"
            icon={AlertCircle}
            variant={
              kpiData.activeRisks <= 5
                ? 'success'
                : kpiData.activeRisks <= 10
                ? 'warning'
                : 'danger'
            }
          />
          <KPICard
            title="High/Extreme Risks"
            value={kpiData.highRisks || 0}
            subtitle="Critical attention required"
            icon={AlertCircle}
            variant={kpiData.highRisks > 0 ? 'danger' : 'success'}
          />
          <KPICard
            title="Change Orders"
            value={kpiData.changeOrders || 0}
            subtitle="Pending approval"
            icon={Activity}
            variant={
              kpiData.changeOrders <= 3
                ? 'success'
                : kpiData.changeOrders <= 7
                ? 'warning'
                : 'danger'
            }
          />
          <KPICard
            title="Change Impact"
            value={`$${Math.abs(kpiData.changeImpact || 0).toLocaleString()}`}
            subtitle={
              kpiData.changeImpact >= 0
                ? 'Additional cost'
                : 'Cost savings'
            }
            icon={kpiData.changeImpact >= 0 ? TrendingUp : TrendingDown}
            variant={kpiData.changeImpact >= 0 ? 'danger' : 'success'}
          />
        </div>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>
            Overall project health indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm font-medium">Cost Performance</p>
                <p className="text-xs text-muted-foreground">
                  CPI of {kpiData.cpi?.toFixed(2) || '0.00'} - {kpiData.cpi >= 1 ? 'On or under budget' : 'Over budget'}
                </p>
              </div>
              <div className={`font-bold text-lg ${kpiData.cpi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                {kpiData.cpi >= 1 ? '✓' : '✗'}
              </div>
            </div>
            
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm font-medium">Schedule Performance</p>
                <p className="text-xs text-muted-foreground">
                  SPI of {kpiData.spi?.toFixed(2) || '0.00'} - {kpiData.spi >= 1 ? 'On or ahead of schedule' : 'Behind schedule'}
                </p>
              </div>
              <div className={`font-bold text-lg ${kpiData.spi >= 1 ? 'text-green-600' : 'text-amber-600'}`}>
                {kpiData.spi >= 1 ? '✓' : '⚠'}
              </div>
            </div>
            
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="text-sm font-medium">Progress Status</p>
                <p className="text-xs text-muted-foreground">
                  {(kpiData.overallProgress || 0).toFixed(1)}% complete - {
                    kpiData.overallProgress >= 75 ? 'Excellent progress' :
                    kpiData.overallProgress >= 50 ? 'Good progress' :
                    kpiData.overallProgress >= 25 ? 'Fair progress' :
                    'Early stage'
                  }
                </p>
              </div>
              <div className={`font-bold text-lg ${
                kpiData.overallProgress >= 75 ? 'text-green-600' :
                kpiData.overallProgress >= 50 ? 'text-blue-600' :
                kpiData.overallProgress >= 25 ? 'text-amber-600' :
                'text-gray-600'
              }`}>
                {(kpiData.overallProgress || 0).toFixed(0)}%
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Risk Management</p>
                <p className="text-xs text-muted-foreground">
                  {kpiData.activeRisks || 0} active risks, {kpiData.highRisks || 0} high/extreme
                </p>
              </div>
              <div className={`font-bold text-lg ${kpiData.highRisks > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {kpiData.highRisks > 0 ? '⚠' : '✓'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Navigate to related dashboards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/projects/${projectId}/dashboard`}>
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Cost Dashboard
              </Button>
            </Link>
            <Link href={`/dashboard/projects/${projectId}/evm`}>
              <Button variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                EVM Dashboard
              </Button>
            </Link>
            <Link href={`/dashboard/projects/${projectId}/progress`}>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Progress Tracking
              </Button>
            </Link>
            <Link href={`/dashboard/projects/${projectId}/risks`}>
              <Button variant="outline">
                <AlertCircle className="h-4 w-4 mr-2" />
                Risk Register
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
