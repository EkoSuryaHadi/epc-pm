'use client';

import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  EVMMetrics,
  formatCurrency,
  getPerformanceColor,
  getStatusBadgeColor,
} from '@/lib/validations/progress';

interface EVMDashboardProps {
  data: EVMMetrics;
  currency?: string;
}

export function EVMDashboard({ data, currency = 'USD' }: EVMDashboardProps) {
  const cpiColor = getPerformanceColor(data.cpi);
  const spiColor = getPerformanceColor(data.spi);

  return (
    <div className="space-y-6">
      {/* Key Metrics Row 1: PV, EV, AC */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Earned Value Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Planned Value (PV)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(data.plannedValue, currency)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Budget × Planned Progress
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Earned Value (EV)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(data.earnedValue, currency)}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                Budget × Actual Progress
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Actual Cost (AC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(data.actualCost, currency)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Total costs incurred
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Indices Row */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Performance Indices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={cpiColor}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Cost Performance Index (CPI)
                <Badge className={getStatusBadgeColor(data.costStatus)}>
                  {data.costStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-5xl font-bold">
                  {data.cpi.toFixed(2)}
                </div>
                {data.cpi >= 1 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div className="text-sm mt-2">
                {data.cpi > 1
                  ? `${((data.cpi - 1) * 100).toFixed(1)}% under budget`
                  : data.cpi < 1
                  ? `${((1 - data.cpi) * 100).toFixed(1)}% over budget`
                  : 'On budget'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                EV / AC = {formatCurrency(data.earnedValue, currency)} /{' '}
                {formatCurrency(data.actualCost, currency)}
              </div>
            </CardContent>
          </Card>

          <Card className={spiColor}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Schedule Performance Index (SPI)
                <Badge className={getStatusBadgeColor(data.scheduleStatus)}>
                  {data.scheduleStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-5xl font-bold">
                  {data.spi.toFixed(2)}
                </div>
                {data.spi >= 1 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div className="text-sm mt-2">
                {data.spi > 1
                  ? `${((data.spi - 1) * 100).toFixed(1)}% ahead of schedule`
                  : data.spi < 1
                  ? `${((1 - data.spi) * 100).toFixed(1)}% behind schedule`
                  : 'On schedule'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                EV / PV = {formatCurrency(data.earnedValue, currency)} /{' '}
                {formatCurrency(data.plannedValue, currency)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Variances Row */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Variances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className={
              data.costVariance >= 0
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }
          >
            <CardHeader className="pb-3">
              <CardTitle
                className={`text-sm font-medium ${
                  data.costVariance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                Cost Variance (CV)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  data.costVariance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {data.costVariance >= 0 ? '+' : ''}
                {formatCurrency(data.costVariance, currency)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                EV - AC = {formatCurrency(data.earnedValue, currency)} -{' '}
                {formatCurrency(data.actualCost, currency)}
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              data.scheduleVariance >= 0
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }
          >
            <CardHeader className="pb-3">
              <CardTitle
                className={`text-sm font-medium ${
                  data.scheduleVariance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                Schedule Variance (SV)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  data.scheduleVariance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {data.scheduleVariance >= 0 ? '+' : ''}
                {formatCurrency(data.scheduleVariance, currency)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                EV - PV = {formatCurrency(data.earnedValue, currency)} -{' '}
                {formatCurrency(data.plannedValue, currency)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Forecasts Row */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Forecasts</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Budget (BAC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data.budget, currency)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Budget at Completion
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              data.estimateAtCompletion > data.budget
                ? 'border-red-200 bg-red-50'
                : 'border-green-200 bg-green-50'
            }
          >
            <CardHeader className="pb-3">
              <CardTitle
                className={`text-sm font-medium ${
                  data.estimateAtCompletion > data.budget
                    ? 'text-red-700'
                    : 'text-green-700'
                }`}
              >
                Estimate at Completion (EAC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  data.estimateAtCompletion > data.budget
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {formatCurrency(data.estimateAtCompletion, currency)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                BAC / CPI = {formatCurrency(data.budget, currency)} / {data.cpi.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estimate to Complete (ETC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data.estimateToComplete, currency)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                EAC - AC = {formatCurrency(data.estimateAtCompletion, currency)} -{' '}
                {formatCurrency(data.actualCost, currency)}
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              data.varianceAtCompletion >= 0
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }
          >
            <CardHeader className="pb-3">
              <CardTitle
                className={`text-sm font-medium ${
                  data.varianceAtCompletion >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                Variance at Completion (VAC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  data.varianceAtCompletion >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {data.varianceAtCompletion >= 0 ? '+' : ''}
                {formatCurrency(data.varianceAtCompletion, currency)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                BAC - EAC = {formatCurrency(data.budget, currency)} -{' '}
                {formatCurrency(data.estimateAtCompletion, currency)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Progress Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Progress Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Planned Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.plannedProgress.toFixed(2)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${data.plannedProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">
                Actual Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {data.actualProgress.toFixed(2)}%
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${data.actualProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              data.progressVariance >= 0
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }
          >
            <CardHeader className="pb-3">
              <CardTitle
                className={`text-sm font-medium ${
                  data.progressVariance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                Progress Variance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  data.progressVariance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {data.progressVariance >= 0 ? '+' : ''}
                {data.progressVariance.toFixed(2)}%
              </div>
              <div
                className={`text-xs mt-1 ${
                  data.progressVariance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {data.progressVariance >= 0 ? 'Ahead of plan' : 'Behind plan'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Warnings/Alerts */}
      {(data.cpi < 0.95 || data.spi < 0.95) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800">
            <ul className="list-disc list-inside space-y-1">
              {data.cpi < 0.95 && (
                <li>
                  Project is over budget (CPI: {data.cpi.toFixed(2)}). Consider cost
                  optimization measures.
                </li>
              )}
              {data.spi < 0.95 && (
                <li>
                  Project is behind schedule (SPI: {data.spi.toFixed(2)}). Review critical
                  tasks and resources.
                </li>
              )}
              {data.estimateAtCompletion > data.budget && (
                <li>
                  Expected to exceed budget by{' '}
                  {formatCurrency(data.estimateAtCompletion - data.budget, currency)} at
                  completion.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
