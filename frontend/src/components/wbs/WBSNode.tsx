'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Trash2, Plus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WBSNode as WBSNodeType } from '@/lib/validations/wbs';
import { cn } from '@/lib/utils';

interface WBSNodeProps {
  node: WBSNodeType;
  level: number;
  onEdit: (node: WBSNodeType) => void;
  onDelete: (node: WBSNodeType) => void;
  onAddChild: (parentNode: WBSNodeType) => void;
  siblings?: WBSNodeType[];
}

export function WBSNode({ 
  node, 
  level, 
  onEdit, 
  onDelete, 
  onAddChild,
  siblings = []
}: WBSNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  // Calculate if THIS NODE's children weightage is valid
  const childrenWeightage = hasChildren 
    ? node.children!.reduce((sum, n) => sum + n.weightage, 0)
    : 0;
  const isChildrenWeightageValid = hasChildren 
    ? Math.abs(childrenWeightage - 100) < 0.01
    : true;

  const levelColors = [
    'bg-blue-50 border-blue-200',
    'bg-green-50 border-green-200',
    'bg-yellow-50 border-yellow-200',
    'bg-purple-50 border-purple-200',
    'bg-pink-50 border-pink-200',
  ];

  const levelColor = levelColors[level % levelColors.length];

  return (
    <div className="space-y-2">
      <div 
        className={cn(
          'border rounded-lg p-3 transition-all hover:shadow-md',
          levelColor
        )}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6" /> // Spacer for alignment
          )}

          {/* WBS Code Badge */}
          <Badge variant="outline" className="font-mono text-xs">
            {node.code}
          </Badge>

          {/* WBS Name */}
          <div className="flex-1">
            <div className="font-medium">{node.name}</div>
            {node.description && (
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {node.description}
              </div>
            )}
          </div>

          {/* Weightage */}
          <div className="flex items-center gap-1">
            <Badge 
              variant={node.weightage > 0 ? 'default' : 'secondary'}
              className="text-xs"
            >
              {node.weightage}%
            </Badge>
          </div>

          {/* Level Badge */}
          <Badge variant="secondary" className="text-xs">
            L{node.level}
          </Badge>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAddChild(node)}
              title="Add child WBS"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(node)}
              title="Edit WBS"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(node)}
              title="Delete WBS"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Children Weightage Warning - Only show if THIS node has children with invalid total */}
        {hasChildren && !isChildrenWeightageValid && (
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            ⚠️ Level {level + 1} total weightage: {Number(childrenWeightage).toFixed(2)}% (should be 100%)
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-2">
          {node.children!.map((child) => (
            <WBSNode
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              siblings={node.children || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
