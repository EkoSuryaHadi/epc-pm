'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportSchema, ReportFormData, reportTypes, getDefaultSections } from '@/lib/validations/report';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ReportTypeSelector } from './ReportTypeSelector';

interface ReportBuilderProps {
  projectId: number;
  onPreview: (data: ReportFormData) => void;
  onGenerate: (data: ReportFormData) => void;
}

export function ReportBuilder({ projectId, onPreview, onGenerate }: ReportBuilderProps) {
  const [reportType, setReportType] = useState<typeof reportTypes[number]>('PROGRESS');
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      projectId,
      reportType: 'PROGRESS',
      title: '',
      dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      dateTo: new Date(),
      format: 'PDF',
      sections: getDefaultSections('PROGRESS'),
      includeCharts: true,
      includeComments: false,
    },
  });

  const dateFrom = watch('dateFrom');
  const dateTo = watch('dateTo');
  const format_ = watch('format');
  const sections = watch('sections');

  const handleReportTypeChange = (type: typeof reportTypes[number]) => {
    setReportType(type);
    setValue('reportType', type);
    setValue('sections', getDefaultSections(type));
  };

  const onSubmit = (data: ReportFormData) => {
    onGenerate(data);
  };

  const handlePreview = () => {
    const data = {
      projectId,
      reportType,
      title: watch('title'),
      dateFrom,
      dateTo,
      format: format_,
      sections,
      includeCharts: watch('includeCharts'),
      includeComments: watch('includeComments'),
    };
    onPreview(data);
  };

  const sectionGroups = [
    {
      title: 'Progress Sections',
      visible: reportType === 'PROGRESS' || reportType === 'COMPREHENSIVE',
      sections: [
        { key: 'progressOverview', label: 'Progress Overview' },
        { key: 'wbsProgress', label: 'WBS Progress Details' },
        { key: 'milestones', label: 'Milestone Achievement' },
        { key: 'evmMetrics', label: 'EVM Metrics (CPI, SPI)' },
      ],
    },
    {
      title: 'Cost Sections',
      visible: reportType === 'COST' || reportType === 'COMPREHENSIVE',
      sections: [
        { key: 'budgetSummary', label: 'Budget Summary' },
        { key: 'costByCategory', label: 'Cost by Category' },
        { key: 'costVariance', label: 'Cost Variance Analysis' },
        { key: 'costTrends', label: 'Cost Trend Charts' },
      ],
    },
    {
      title: 'Schedule Sections',
      visible: reportType === 'SCHEDULE' || reportType === 'COMPREHENSIVE',
      sections: [
        { key: 'scheduleOverview', label: 'Schedule Overview' },
        { key: 'criticalPath', label: 'Critical Path Analysis' },
        { key: 'taskProgress', label: 'Task Progress Details' },
        { key: 'delayAnalysis', label: 'Delay Analysis' },
      ],
    },
    {
      title: 'Risk Sections',
      visible: reportType === 'RISK' || reportType === 'COMPREHENSIVE',
      sections: [
        { key: 'riskSummary', label: 'Risk Summary' },
        { key: 'riskMatrix', label: 'Risk Assessment Matrix' },
        { key: 'changeOrders', label: 'Change Orders' },
        { key: 'mitigationStatus', label: 'Mitigation Status' },
      ],
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>1. Select Report Type</CardTitle>
          <CardDescription>Choose the type of report you want to generate</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportTypeSelector value={reportType} onChange={handleReportTypeChange} />
        </CardContent>
      </Card>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>2. Report Configuration</CardTitle>
          <CardDescription>Configure your report details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Monthly Progress Report - October 2025"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateFrom && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => setValue('dateFrom', date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dateFrom && (
                <p className="text-sm text-red-500">{errors.dateFrom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>To Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateTo && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => setValue('dateTo', date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dateTo && (
                <p className="text-sm text-red-500">{errors.dateTo.message}</p>
              )}
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format *</Label>
            <Select
              value={format_}
              onValueChange={(value) => setValue('format', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF Only</SelectItem>
                <SelectItem value="EXCEL">Excel Only</SelectItem>
                <SelectItem value="BOTH">Both (PDF + Excel)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Options */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCharts"
                checked={watch('includeCharts')}
                onCheckedChange={(checked) => setValue('includeCharts', checked as boolean)}
              />
              <Label htmlFor="includeCharts" className="font-normal cursor-pointer">
                Include Charts and Graphs
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeComments"
                checked={watch('includeComments')}
                onCheckedChange={(checked) => setValue('includeComments', checked as boolean)}
              />
              <Label htmlFor="includeComments" className="font-normal cursor-pointer">
                Include Comments and Notes
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Selection */}
      <Card>
        <CardHeader>
          <CardTitle>3. Select Report Sections</CardTitle>
          <CardDescription>Choose which sections to include in your report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Executive Summary (always available) */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">General</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="executiveSummary"
                  checked={sections.executiveSummary}
                  onCheckedChange={(checked) =>
                    setValue('sections.executiveSummary', checked as boolean)
                  }
                />
                <Label htmlFor="executiveSummary" className="font-normal cursor-pointer">
                  Executive Summary
                </Label>
              </div>
            </div>

            {/* Dynamic Section Groups */}
            {sectionGroups
              .filter((group) => group.visible)
              .map((group) => (
                <div key={group.title} className="space-y-3">
                  <h4 className="font-semibold text-sm">{group.title}</h4>
                  <div className="space-y-2 pl-4">
                    {group.sections.map((section) => (
                      <div key={section.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={section.key}
                          checked={sections[section.key as keyof typeof sections]}
                          onCheckedChange={(checked) =>
                            setValue(
                              `sections.${section.key}` as any,
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor={section.key}
                          className="font-normal cursor-pointer"
                        >
                          {section.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handlePreview}
          className="flex-1"
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview Report
        </Button>
        <Button type="submit" className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Generate & Download
        </Button>
      </div>
    </form>
  );
}
