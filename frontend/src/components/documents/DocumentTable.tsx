'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Download, Eye, Edit, Trash2, MessageSquare, Search } from 'lucide-react';
import { Document, DOCUMENT_STATUSES, formatFileSize } from '@/lib/validations/document';
import { createApiMethods } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DocumentTableProps {
  documents: Document[];
  onRefresh: () => void;
}

export function DocumentTable({ documents, onRefresh }: DocumentTableProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredDocuments = documents.filter((doc) => {
    const search = searchTerm.toLowerCase();
    return (
      doc.documentNo.toLowerCase().includes(search) ||
      doc.title.toLowerCase().includes(search) ||
      doc.category.toLowerCase().includes(search) ||
      (doc.discipline && doc.discipline.toLowerCase().includes(search))
    );
  });

  const handleDownload = async (doc: Document) => {
    if (!session?.user?.accessToken) return;

    try {
      const api = createApiMethods(session.user.accessToken);
      const response = await api.documents.download(doc.id);
      
      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${doc.title}.${doc.mimeType.split('/')[1]}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Document downloaded successfully',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download document',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !session?.user?.accessToken) return;

    setIsDeleting(true);
    try {
      const api = createApiMethods(session.user.accessToken);
      await api.documents.delete(deleteId);

      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });

      onRefresh();
      setDeleteId(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete document',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = DOCUMENT_STATUSES.find((s) => s.value === status);
    if (!statusConfig) return <Badge>{status}</Badge>;

    const colorMap: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colorMap[statusConfig.color]}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by document number, title, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document No</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Discipline</TableHead>
              <TableHead>Rev</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-gray-500">
                  {searchTerm ? 'No documents found matching your search' : 'No documents yet'}
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.documentNo}</TableCell>
                  <TableCell>{doc.title}</TableCell>
                  <TableCell>{doc.category}</TableCell>
                  <TableCell>{doc.discipline || '-'}</TableCell>
                  <TableCell>{doc.revision}</TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatFileSize(doc.fileSize)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {doc.uploadedBy?.name || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {doc._count && doc._count.comments > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MessageSquare className="h-4 w-4" />
                          <span>{doc._count.comments}</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(doc.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone and
              will permanently delete the file from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
