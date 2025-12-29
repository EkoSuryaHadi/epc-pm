'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CostControlPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cost Control</h1>
        <p className="text-muted-foreground mt-1">
          Global cost overview across all projects
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <CardTitle>Project-Specific Cost Control</CardTitle>
              <CardDescription>
                Cost management is available within each project
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To manage costs, budgets, and expenses, please select a project first. 
            Each project has its own dedicated cost control dashboard with:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Budget allocation and tracking</li>
            <li>Cost codes and categories</li>
            <li>Actual vs planned analysis</li>
            <li>Cost variance reports</li>
            <li>Expense entries</li>
          </ul>

          <div className="pt-4">
            <Link href="/dashboard/projects">
              <Button>
                Go to Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Navigate to cost features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>From any project:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to Projects page</li>
              <li>Select a project</li>
              <li>Click "Cost Dashboard" button</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
