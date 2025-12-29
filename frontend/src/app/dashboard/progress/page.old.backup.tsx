'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProgressPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress Tracking</h1>
        <p className="text-muted-foreground mt-1">
          Global progress overview across all projects
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <CardTitle>Project-Specific Progress</CardTitle>
              <CardDescription>
                Progress tracking is available within each project
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To track progress and performance, please select a project first. 
            Each project has its own dedicated progress dashboard with:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Physical progress tracking</li>
            <li>Earned Value Management (EVM)</li>
            <li>S-Curve analysis</li>
            <li>Progress reports</li>
            <li>Performance indicators (CPI, SPI)</li>
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
          <CardDescription>Navigate to progress features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>From any project:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to Projects page</li>
              <li>Select a project</li>
              <li>Click "Progress Tracking" button</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
