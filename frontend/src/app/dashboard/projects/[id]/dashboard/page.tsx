'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

import { KPICard } from '@/components/cost/KPICard';
import { CostSummaryTable } from '@/components/cost/CostSummaryTable';
import { DashboardFilters } from '@/components/cost/DashboardFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createApiMethods } from '@/lib/api-client';
import { exportToPDF, exportToExcel } from '@/lib/utils/export';

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  
  // Raw data
  const [costCodes, setCostCodes] = useState<any[]>([]);
  const [costEntries, setCostEntries] = useState<any[]>([]);
  
  // Processed data
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  // Metrics
  const [metrics, setMetrics] = useState({
    totalBudget: 0,
    totalActual: 0,
    totalCommitment: 0,
    totalForecast: 0,
    variance: 0,
    variancePercent: 0,
    cpi: 0,
    spi: 1,
  });

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Fetch data
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

        // Fetch cost codes and entries
        const codesRes = await api.cost.getCostCodes(projectId);
        const entriesRes = await api.cost.getCostEntries(projectId);

        setCostCodes(codesRes.data);
        setCostEntries(entriesRes.data);

        // Process data
        processData(codesRes.data, entriesRes.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
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
  }, [session, projectId, toast]);

  // Process and calculate metrics
  const processData = (codes: any[], entries: any[]) => {
    const summary = codes.map((code: any) => {
      const budget = Number(code.budget);
      
      const actual = entries
        .filter((e: any) => e.costCodeId === code.id && e.entryType === 'ACTUAL')
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0);
      
      const commitment = entries
        .filter((e: any) => e.costCodeId === code.id && e.entryType === 'COMMITMENT')
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0);
      
      const forecast = entries
        .filter((e: any) => e.costCodeId === code.id && e.entryType === 'FORECAST')
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0);
      
      const variance = budget - actual;
      const variancePercent = budget > 0 ? (variance / budget) * 100 : 0;

      return {
        code: code.code,
        name: code.name,
        category: code.category,
        budget,
        actual,
        commitment,
        forecast,
        variance,
        variancePercent,
      };
    });

    setSummaryData(summary);
    setFilteredData(summary);

    // Calculate overall metrics
    const totalBudget = summary.reduce((sum, item) => sum + item.budget, 0);
    const totalActual = summary.reduce((sum, item) => sum + item.actual, 0);
    const totalCommitment = summary.reduce((sum, item) => sum + item.commitment, 0);
    const totalForecast = summary.reduce((sum, item) => sum + item.forecast, 0);
    const variance = totalBudget - totalActual;
    const variancePercent = totalBudget > 0 ? (variance / totalBudget) * 100 : 0;

    // CPI = Earned Value / Actual Cost
    // For simplicity, using actual as earned value
    const cpi = totalActual > 0 ? totalActual / totalActual : 1;

    // SPI = Earned Value / Planned Value
    // Assuming planned = budget for simplicity
    const spi = totalBudget > 0 ? totalActual / totalBudget : 0;

    setMetrics({
      totalBudget,
      totalActual,
      totalCommitment,
      totalForecast,
      variance,
      variancePercent,
      cpi,
      spi,
    });
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...summaryData];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Date range filter (filter entries, then recalculate)
    if (dateFrom || dateTo) {
      const filteredEntries = costEntries.filter((entry: any) => {
        const entryDate = new Date(entry.entryDate);
        if (dateFrom && entryDate < dateFrom) return false;
        if (dateTo && entryDate > dateTo) return false;
        return true;
      });

      // Recalculate with filtered entries
      filtered = filtered.map((item) => {
        const actual = filteredEntries
          .filter((e: any) => e.costCode?.code === item.code && e.entryType === 'ACTUAL')
          .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

        const variance = item.budget - actual;
        const variancePercent = item.budget > 0 ? (variance / item.budget) * 100 : 0;

        return { ...item, actual, variance, variancePercent };
      });
    }

    setFilteredData(filtered);
  }, [categoryFilter, dateFrom, dateTo, summaryData, costEntries]);

  // Export handlers
  const handleExportPDF = () => {
    exportToPDF(projectName, metrics, filteredData);
    toast({
      title: 'Success',
      description: 'Dashboard exported to PDF',
    });
  };

  const handleExportExcel = () => {
    exportToExcel(projectName, metrics, filteredData);
    toast({
      title: 'Success',
      description: 'Dashboard exported to Excel',
    });
  };

  const handleResetFilters = () => {
    setCategoryFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Get unique categories
  const categories = Array.from(new Set(costCodes.map((c) => c.category)));

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/dashboard/projects" className="hover:text-gray-900">
            Projects
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="hover:text-gray-900"
          >
            {projectName || 'Project'}
          </Link>
          <span>/</span>
          <span className="text-gray-900">Dashboard</span>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Cost Performance Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive cost metrics and performance indicators
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Budget"
          value={`$${metrics.totalBudget.toLocaleString()}`}
          subtitle="Allocated budget"
          icon={DollarSign}
          variant="default"
        />
        <KPICard
          title="Total Actual"
          value={`$${metrics.totalActual.toLocaleString()}`}
          subtitle="Spent to date"
          icon={TrendingDown}
          variant={metrics.totalActual > metrics.totalBudget ? 'danger' : 'success'}
        />
        <KPICard
          title="Variance"
          value={`$${Math.abs(metrics.variance).toLocaleString()}`}
          subtitle={`${metrics.variance >= 0 ? 'Under' : 'Over'} budget by ${Math.abs(metrics.variancePercent).toFixed(1)}%`}
          icon={metrics.variance >= 0 ? TrendingUp : AlertCircle}
          variant={metrics.variance >= 0 ? 'success' : 'danger'}
          trend={{
            value: metrics.variancePercent,
            isPositive: metrics.variance >= 0,
          }}
        />
        <KPICard
          title="CPI"
          value={metrics.cpi.toFixed(2)}
          subtitle="Cost Performance Index"
          icon={TrendingUp}
          variant={metrics.cpi >= 1 ? 'success' : 'warning'}
        />
      </div>

      {/* Additional KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Commitment"
          value={`$${metrics.totalCommitment.toLocaleString()}`}
          subtitle="Purchase orders"
          icon={DollarSign}
          variant="warning"
        />
        <KPICard
          title="Total Forecast"
          value={`$${metrics.totalForecast.toLocaleString()}`}
          subtitle="Projected costs"
          icon={TrendingUp}
          variant="default"
        />
        <KPICard
          title="SPI"
          value={metrics.spi.toFixed(2)}
          subtitle="Schedule Performance Index"
          icon={TrendingUp}
          variant={metrics.spi >= 1 ? 'success' : 'warning'}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Export</CardTitle>
          <CardDescription>
            Filter data by category and date range, or export reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardFilters
            categories={categories}
            onCategoryChange={setCategoryFilter}
            onDateRangeChange={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
            }}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            onReset={handleResetFilters}
          />
        </CardContent>
      </Card>

      {/* Cost Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Summary</CardTitle>
          <CardDescription>
            Detailed breakdown by cost code ({filteredData.length} items)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CostSummaryTable data={filteredData} />
        </CardContent>
      </Card>
    </div>
  );
}
