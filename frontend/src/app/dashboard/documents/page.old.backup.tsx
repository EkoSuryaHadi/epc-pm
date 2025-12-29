'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DocumentsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
        <p className="text-muted-foreground mt-1">
          Global document repository across all projects
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FileText className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <CardTitle>Project-Specific Documents</CardTitle>
              <CardDescription>
                Document management is available within each project
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To manage documents, uploads, and files, please select a project first. 
            Each project has its own dedicated document management with:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Document upload and storage</li>
            <li>Version control</li>
            <li>Document categories</li>
            <li>Comments and reviews</li>
            <li>Status tracking (Draft, Approved, etc.)</li>
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
          <CardDescription>Navigate to document features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>From any project:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to Projects page</li>
              <li>Select a project</li>
              <li>Click "Documents" button</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
