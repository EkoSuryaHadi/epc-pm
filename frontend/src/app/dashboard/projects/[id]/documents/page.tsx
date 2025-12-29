'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Upload, FileText } from 'lucide-react';
import { Document } from '@/lib/validations/document';
import { createApiMethods } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentUploadForm } from '@/components/documents/DocumentUploadForm';
import { DocumentTable } from '@/components/documents/DocumentTable';
import { useToast } from '@/hooks/use-toast';

export default function DocumentsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: session } = useSession();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchDocuments = async () => {
    if (!session?.user?.accessToken) return;

    setIsLoading(true);
    try {
      const api = createApiMethods(session.user.accessToken);
      const response = await api.documents.getAll(projectId);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load documents',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchDocuments();
    }
  }, [session, projectId]);

  // Statistics
  const stats = {
    total: documents.length,
    draft: documents.filter((d) => d.status === 'DRAFT').length,
    inReview: documents.filter((d) => d.status === 'IN_REVIEW').length,
    approved: documents.filter((d) => d.status === 'APPROVED').length,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-gray-600 mt-1">Manage project documents and files</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-gray-600">{stats.draft}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              In Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-blue-600">{stats.inReview}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-600">{stats.approved}</span>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Document Register</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading documents...</div>
          ) : (
            <DocumentTable documents={documents} onRefresh={fetchDocuments} />
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <DocumentUploadForm
        projectId={projectId}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={fetchDocuments}
      />
    </div>
  );
}
