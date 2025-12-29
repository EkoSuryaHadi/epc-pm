import { z } from 'zod';

export const wbsSchema = z.object({
  code: z.string()
    .min(1, 'WBS code is required')
    .max(20, 'WBS code must not exceed 20 characters')
    .regex(/^[A-Z0-9.-]+$/, 'WBS code must contain only uppercase letters, numbers, dots, and hyphens'),
  
  name: z.string()
    .min(2, 'WBS name must be at least 2 characters')
    .max(100, 'WBS name must not exceed 100 characters'),
  
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  
  parentId: z.string().optional().nullable(),
  
  weightage: z.number({
    required_error: 'Weightage is required',
    invalid_type_error: 'Weightage must be a number',
  })
    .min(0, 'Weightage must be at least 0')
    .max(100, 'Weightage must not exceed 100'),
  
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order must be at least 0')
    .default(0),
});

export type WBSFormData = z.infer<typeof wbsSchema>;

export interface WBSNode {
  id: string;
  projectId: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string | null;
  level: number;
  weightage: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  children?: WBSNode[];
}

// Helper to generate WBS code
export const generateWBSCode = (parentCode?: string, childIndex?: number) => {
  if (!parentCode) {
    // Root level
    return '1';
  }
  
  // Child level
  const index = childIndex !== undefined ? childIndex + 1 : 1;
  return `${parentCode}.${index}`;
};

// Helper to calculate total weightage
export const calculateTotalWeightage = (nodes: WBSNode[]): number => {
  return nodes.reduce((sum, node) => sum + node.weightage, 0);
};

// Helper to validate weightage sum
export const validateWeightageSum = (nodes: WBSNode[]): {
  isValid: boolean;
  total: number;
  message?: string;
} => {
  const total = calculateTotalWeightage(nodes);
  const isValid = Math.abs(total - 100) < 0.01; // Allow small floating point errors
  
  return {
    isValid,
    total: Number(total),
    message: isValid 
      ? undefined 
      : `Total weightage is ${Number(total).toFixed(2)}%. Must equal 100%.`,
  };
};

// Helper to build tree structure from flat array
export const buildWBSTree = (flatNodes: WBSNode[]): WBSNode[] => {
  const nodeMap = new Map<string, WBSNode>();
  const rootNodes: WBSNode[] = [];

  // Create a map of all nodes
  flatNodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] });
  });

  // Build the tree
  flatNodes.forEach(node => {
    const currentNode = nodeMap.get(node.id)!;
    
    if (!node.parentId) {
      // Root node
      rootNodes.push(currentNode);
    } else {
      // Child node
      const parentNode = nodeMap.get(node.parentId);
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(currentNode);
      }
    }
  });

  // Sort by order
  const sortNodes = (nodes: WBSNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(rootNodes);
  return rootNodes;
};

// Helper to flatten tree to array
export const flattenWBSTree = (nodes: WBSNode[]): WBSNode[] => {
  const result: WBSNode[] = [];
  
  const flatten = (nodeList: WBSNode[]) => {
    nodeList.forEach(node => {
      result.push(node);
      if (node.children && node.children.length > 0) {
        flatten(node.children);
      }
    });
  };
  
  flatten(nodes);
  return result;
};

// Helper to get max level in tree
export const getMaxLevel = (nodes: WBSNode[]): number => {
  let maxLevel = 0;
  
  const checkLevel = (nodeList: WBSNode[]) => {
    nodeList.forEach(node => {
      if (node.level > maxLevel) {
        maxLevel = node.level;
      }
      if (node.children && node.children.length > 0) {
        checkLevel(node.children);
      }
    });
  };
  
  checkLevel(nodes);
  return maxLevel;
};
