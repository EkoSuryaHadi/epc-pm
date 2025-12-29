'use client';

import { useState } from 'react';
import { WBSNode } from './WBSNode';
import { WBSFormDialog } from './WBSFormDialog';
import { 
  WBSNode as WBSNodeType, 
  WBSFormData, 
  calculateTotalWeightage,
  validateWeightageSum,
} from '@/lib/validations/wbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WBSTreeProps {
  nodes: WBSNodeType[];
  onCreateNode: (data: WBSFormData) => Promise<void>;
  onUpdateNode: (id: string, data: WBSFormData) => Promise<void>;
  onDeleteNode: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function WBSTree({
  nodes,
  onCreateNode,
  onUpdateNode,
  onDeleteNode,
  isLoading = false,
}: WBSTreeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editNode, setEditNode] = useState<WBSNodeType | null>(null);
  const [parentNode, setParentNode] = useState<WBSNodeType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flatten tree to get all nodes (nodes might be tree structure with children)
  const flatNodes = nodes.reduce<WBSNodeType[]>((acc, node) => {
    // Add current node without children for counting
    const { children, ...nodeWithoutChildren } = node;
    acc.push(nodeWithoutChildren as WBSNodeType);
    
    // Recursively add children
    if (children && children.length > 0) {
      const flattenChildren = (childNodes: WBSNodeType[]): WBSNodeType[] => {
        return childNodes.reduce<WBSNodeType[]>((childAcc, child) => {
          const { children: grandChildren, ...childWithoutChildren } = child;
          childAcc.push(childWithoutChildren as WBSNodeType);
          if (grandChildren && grandChildren.length > 0) {
            childAcc.push(...flattenChildren(grandChildren));
          }
          return childAcc;
        }, []);
      };
      acc.push(...flattenChildren(children));
    }
    
    return acc;
  }, []);

  // Get root level nodes from flat nodes for validation
  const rootNodesFlat = flatNodes.filter(node => !node.parentId);
  
  // Validate weightage for root level
  const rootWeightageValidation = validateWeightageSum(rootNodesFlat);
  
  // Get tree structure root nodes (with children) for rendering
  const rootNodesTree = nodes.filter(node => !node.parentId);

  const handleEdit = (node: WBSNodeType) => {
    setEditNode(node);
    setParentNode(null);
    setDialogOpen(true);
  };

  const handleDelete = async (node: WBSNodeType) => {
    if (!confirm(`Are you sure you want to delete "${node.code} ${node.name}"?\n\nThis will also delete all child elements.`)) {
      return;
    }

    try {
      await onDeleteNode(node.id);
    } catch (error) {
      console.error('Error deleting WBS node:', error);
    }
  };

  const handleAddChild = (parent: WBSNodeType) => {
    setEditNode(null);
    setParentNode(parent);
    setDialogOpen(true);
  };

  const handleAddRoot = () => {
    setEditNode(null);
    setParentNode(null);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (data: WBSFormData) => {
    setIsSubmitting(true);
    try {
      if (editNode) {
        await onUpdateNode(editNode.id, data);
      } else {
        await onCreateNode(data);
      }
      setDialogOpen(false);
      setEditNode(null);
      setParentNode(null);
    } catch (error) {
      console.error('Error saving WBS node:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSiblingsForNode = (node: WBSNodeType | null): WBSNodeType[] => {
    if (!node && !parentNode) {
      // Root level siblings
      return rootNodesFlat;
    }
    
    if (parentNode) {
      // Get siblings of new child
      return flatNodes.filter(n => n.parentId === parentNode.id);
    }

    if (node?.parentId) {
      // Get siblings of existing node
      return flatNodes.filter(n => n.parentId === node.parentId);
    }

    return rootNodesFlat;
  };

  if (flatNodes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="text-gray-400 text-5xl">🌳</div>
            <div>
              <h3 className="text-lg font-medium mb-1">No WBS Structure Yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create your first Work Breakdown Structure element to get started
              </p>
            </div>
            <Button onClick={handleAddRoot}>
              <Plus className="mr-2 h-4 w-4" />
              Add Root WBS
            </Button>
          </div>
        </CardContent>

        <WBSFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleFormSubmit}
          editNode={editNode}
          parentNode={parentNode}
          siblings={getSiblingsForNode(editNode)}
          isSubmitting={isSubmitting}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>WBS Structure</CardTitle>
              <p className="text-sm text-gray-600">
                {flatNodes.length} element{flatNodes.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <Button onClick={handleAddRoot}>
              <Plus className="mr-2 h-4 w-4" />
              Add Root WBS
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Weightage Validation Alert */}
      {!rootWeightageValidation.isValid && rootNodesTree.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Root level weightage total is {Number(rootWeightageValidation.total).toFixed(2)}%. 
            It should equal 100%.
          </AlertDescription>
        </Alert>
      )}

      {rootWeightageValidation.isValid && rootNodesTree.length > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Root level weightage is valid (100%)
          </AlertDescription>
        </Alert>
      )}

      {/* WBS Tree */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            {rootNodesTree.map((node) => (
              <WBSNode
                key={node.id}
                node={node}
                level={0}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
                siblings={rootNodesFlat}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-gray-600">Total Elements:</span>{' '}
                <Badge variant="secondary">{flatNodes.length}</Badge>
              </div>
              <div>
                <span className="text-gray-600">Root Elements:</span>{' '}
                <Badge variant="secondary">{rootNodesTree.length}</Badge>
              </div>
              <div>
                <span className="text-gray-600">Root Weightage:</span>{' '}
                <Badge 
                  variant={rootWeightageValidation.isValid ? 'default' : 'destructive'}
                >
                  {Number(rootWeightageValidation.total).toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <WBSFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleFormSubmit}
        editNode={editNode}
        parentNode={parentNode}
        siblings={getSiblingsForNode(editNode)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
