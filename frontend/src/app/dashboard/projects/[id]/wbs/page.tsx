'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

import { WBSTree } from '@/components/wbs/WBSTree';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createApiMethods } from '@/lib/api-client';
import { 
  WBSNode, 
  WBSFormData, 
  buildWBSTree,
} from '@/lib/validations/wbs';

export default function WBSPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const projectId = params.id as string;
  
  const [nodes, setNodes] = useState<WBSNode[]>([]);
  const [treeNodes, setTreeNodes] = useState<WBSNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');

  // Fetch WBS nodes
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

        // Fetch WBS nodes
        const wbsRes = await api.wbs.getAll(projectId);
        const flatNodes = wbsRes.data;
        
        setNodes(flatNodes);
        setTreeNodes(buildWBSTree(flatNodes));
      } catch (error: any) {
        console.error('Error fetching WBS:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load WBS structure',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, projectId, toast]);

  const handleCreateNode = async (data: WBSFormData) => {
    if (!session?.user?.accessToken) return;

    try {
      const api = createApiMethods(session.user.accessToken);
      
      // Calculate level based on parent
      let level = 0;
      if (data.parentId) {
        const parent = nodes.find(n => n.id === data.parentId);
        level = parent ? parent.level + 1 : 0;
      }

      const payload = {
        ...data,
        projectId,
        level,
      };

      const response = await api.wbs.create(payload);
      const newNode = response.data;

      // Update local state
      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      setTreeNodes(buildWBSTree(updatedNodes));

      toast({
        title: 'Success',
        description: 'WBS element created successfully',
      });
    } catch (error: any) {
      console.error('Error creating WBS node:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create WBS element',
      });
      throw error;
    }
  };

  const handleUpdateNode = async (id: string, data: WBSFormData) => {
    if (!session?.user?.accessToken) return;

    try {
      const api = createApiMethods(session.user.accessToken);
      
      // Calculate level based on parent
      let level = 0;
      if (data.parentId) {
        const parent = nodes.find(n => n.id === data.parentId);
        level = parent ? parent.level + 1 : 0;
      }

      const payload = {
        ...data,
        level,
      };

      const response = await api.wbs.update(id, payload);
      const updatedNode = response.data;

      // Update local state
      const updatedNodes = nodes.map(n => n.id === id ? updatedNode : n);
      setNodes(updatedNodes);
      setTreeNodes(buildWBSTree(updatedNodes));

      toast({
        title: 'Success',
        description: 'WBS element updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating WBS node:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update WBS element',
      });
      throw error;
    }
  };

  const handleDeleteNode = async (id: string) => {
    if (!session?.user?.accessToken) return;

    try {
      const api = createApiMethods(session.user.accessToken);
      await api.wbs.delete(id);

      // Remove node and its children from local state
      const nodeToDelete = nodes.find(n => n.id === id);
      if (!nodeToDelete) return;

      const idsToDelete = new Set([id]);
      
      // Recursively find all children
      const findChildren = (parentId: string) => {
        nodes.forEach(n => {
          if (n.parentId === parentId) {
            idsToDelete.add(n.id);
            findChildren(n.id);
          }
        });
      };
      findChildren(id);

      // Update local state
      const updatedNodes = nodes.filter(n => !idsToDelete.has(n.id));
      setNodes(updatedNodes);
      setTreeNodes(buildWBSTree(updatedNodes));

      toast({
        title: 'Success',
        description: `Deleted WBS element and ${idsToDelete.size - 1} child elements`,
      });
    } catch (error: any) {
      console.error('Error deleting WBS node:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete WBS element',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading WBS structure...</p>
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
          <Link href={`/dashboard/projects/${projectId}`} className="hover:text-gray-900">
            {projectName || 'Project'}
          </Link>
          <span>/</span>
          <span className="text-gray-900">WBS</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Work Breakdown Structure
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize project work into manageable hierarchical elements
            </p>
          </div>
        </div>
      </div>

      {/* WBS Tree */}
      <WBSTree
        nodes={treeNodes}
        onCreateNode={handleCreateNode}
        onUpdateNode={handleUpdateNode}
        onDeleteNode={handleDeleteNode}
        isLoading={loading}
      />
    </div>
  );
}
