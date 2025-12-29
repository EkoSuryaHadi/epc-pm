'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RisksPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Risk Management</h1>
        <p className="text-muted-foreground mt-1">
          Global risk overview across all projects
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <CardTitle>Project-Specific Risks</CardTitle>
              <CardDescription>
                Risk management is available within each project
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To manage risks and change orders, please select a project first. 
            Each project has its own dedicated risk management with:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Risk register and identification</li>
            <li>Risk matrix (5×5) visualization</li>
            <li>Risk scoring (Probability × Impact)</li>
            <li>Mitigation strategies</li>
            <li>Change order management</li>
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
          <CardDescription>Navigate to risk features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>From any project:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to Projects page</li>
              <li>Select a project</li>
              <li>Click "Risks" button</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
