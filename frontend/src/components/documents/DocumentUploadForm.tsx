'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { Upload, X, FileIcon } from 'lucide-react';
import { documentSchema, type DocumentFormData, DOCUMENT_CATEGORIES, DOCUMENT_DISCIPLINES, formatFileSize } from '@/lib/validations/document';
import { createApiMethods } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadFormProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentUploadForm({ projectId, open, onClose, onSuccess }: DocumentUploadFormProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      revision: 'A',
      status: 'DRAFT',
    },
  });

  const category = watch('category');
  const discipline = watch('discipline');
  const status = watch('status');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const onSubmit = async (data: DocumentFormData) => {
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a file to upload',
      });
      return;
    }

    if (!session?.user?.accessToken) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to upload documents',
      });
      return;
    }

    setIsUploading(true);

    try {
      const api = createApiMethods(session.user.accessToken);
      const metadata = {
        ...data,
        projectId,
      };

      await api.documents.upload(selectedFile, metadata);

      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });

      reset();
      setSelectedFile(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.response?.data?.message || 'Failed to upload document',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      reset();
      setSelectedFile(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* File Upload Area */}
          <div>
            <Label>File</Label>
            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-8 w-8 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, Word, Excel, Images (Max 50MB)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.txt"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" className="mt-4" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Document Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="documentNo">Document Number *</Label>
              <Input
                id="documentNo"
                {...register('documentNo')}
                placeholder="e.g., ENG-DWG-001"
              />
              {errors.documentNo && (
                <p className="text-sm text-red-500 mt-1">{errors.documentNo.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="revision">Revision *</Label>
              <Input
                id="revision"
                {...register('revision')}
                placeholder="e.g., A, B, 01"
              />
              {errors.revision && (
                <p className="text-sm text-red-500 mt-1">{errors.revision.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Document title"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="discipline">Discipline</Label>
              <Select value={discipline} onValueChange={(value) => setValue('discipline', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_DISCIPLINES.map((disc) => (
                    <SelectItem key={disc} value={disc}>
                      {disc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: any) => setValue('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="IN_REVIEW">In Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="SUPERSEDED">Superseded</SelectItem>
                <SelectItem value="VOID">Void</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of the document"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedFile || isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
