'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, TrendingUp } from 'lucide-react';

import { BudgetVsActualChart } from '@/components/cost/charts/BudgetVsActualChart';
import { CostByCategoryChart } from '@/components/cost/charts/CostByCategoryChart';
import { CostTrendChart } from '@/components/cost/charts/CostTrendChart';
import { VarianceChart } from '@/components/cost/charts/VarianceChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createApiMethods } from '@/lib/api-client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export default function CostAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [budgetVsActualData, setBudgetVsActualData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [varianceData, setVarianceData] = useState<any[]>([]);

  // Fetch and process data
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

        const costCodes = codesRes.data;
        const costEntries = entriesRes.data;

        // Process Budget vs Actual by Cost Code
        const budgetVsActual = costCodes.map((code: any) => {
          const budget = Number(code.budget);
          const actual = costEntries
            .filter((e: any) => e.costCodeId === code.id && e.entryType === 'ACTUAL')
            .reduce((sum: number, e: any) => sum + Number(e.amount), 0);
          
          return {
            name: code.code,
            budget,
            actual,
            variance: budget - actual,
          };
        });
        setBudgetVsActualData(budgetVsActual);

        // Process Cost by Category
        const categoryMap: Record<string, number> = {};
        costCodes.forEach((code: any) => {
          const category = code.category;
          const actual = costEntries
            .filter((e: any) => e.costCodeId === code.id && e.entryType === 'ACTUAL')
            .reduce((sum: number, e: any) => sum + Number(e.amount), 0);
          
          categoryMap[category] = (categoryMap[category] || 0) + actual;
        });

        const totalCost = Object.values(categoryMap).reduce((a, b) => a + b, 0);
        const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({
          name,
          value,
          percentage: (value / totalCost) * 100,
        }));
        setCategoryData(categoryChartData);

        // Process Cost Trend (by date)
        const entriesByDate: Record<string, any> = {};
        
        costEntries.forEach((entry: any) => {
          const date = format(new Date(entry.entryDate), 'yyyy-MM-dd');
          
          if (!entriesByDate[date]) {
            entriesByDate[date] = {
              date,
              budget: 0,
              actual: 0,
              forecast: 0,
              commitment: 0,
            };
          }

          const amount = Number(entry.amount);
          const type = entry.entryType.toLowerCase();
          entriesByDate[date][type] += amount;
        });

        // Sort by date and create cumulative trend
        const sortedDates = Object.keys(entriesByDate).sort();
        let cumulativeBudget = 0;
        let cumulativeActual = 0;
        let cumulativeForecast = 0;
        let cumulativeCommitment = 0;

        const trend = sortedDates.map((date) => {
          const dayData = entriesByDate[date];
          cumulativeBudget += dayData.budget;
          cumulativeActual += dayData.actual;
          cumulativeForecast += dayData.forecast;
          cumulativeCommitment += dayData.commitment;

          return {
            date,
            budget: cumulativeBudget,
            actual: cumulativeActual,
            forecast: cumulativeForecast,
            commitment: cumulativeCommitment,
          };
        });
        setTrendData(trend);

        // Process Variance by Cost Code
        const variance = costCodes.map((code: any) => {
          const budget = Number(code.budget);
          const actual = costEntries
            .filter((e: any) => e.costCodeId === code.id && e.entryType === 'ACTUAL')
            .reduce((sum: number, e: any) => sum + Number(e.amount), 0);
          
          const varianceAmount = budget - actual;
          const variancePercent = budget > 0 ? (varianceAmount / budget) * 100 : 0;

          return {
            name: code.code,
            variance: varianceAmount,
            variancePercent,
          };
        });
        setVarianceData(variance);

      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load cost analysis data',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading cost analysis...</p>
        </div>
      </div>
    );
  }

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
          <span className="text-gray-900">Cost Analysis</span>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              Cost Analysis
            </h1>
            <p className="text-muted-foreground mt-1">
              Visual insights and cost performance metrics
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
            <CardDescription>
              Comparison of budgeted and actual costs by cost code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetVsActualChart data={budgetVsActualData} />
          </CardContent>
        </Card>

        {/* Cost by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Cost by Category</CardTitle>
            <CardDescription>
              Distribution of actual costs across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CostByCategoryChart data={categoryData} />
          </CardContent>
        </Card>

        {/* Cost Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cost Trend Over Time</CardTitle>
            <CardDescription>
              Cumulative cost progression by entry type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CostTrendChart data={trendData} />
          </CardContent>
        </Card>

        {/* Variance Analysis */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Variance Analysis</CardTitle>
            <CardDescription>
              Budget variance (positive = under budget, negative = over budget)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VarianceChart data={varianceData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
