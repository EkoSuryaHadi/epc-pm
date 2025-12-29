'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { wbsSchema, WBSFormData, WBSNode, generateWBSCode } from '@/lib/validations/wbs';

interface WBSFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: WBSFormData) => Promise<void>;
  editNode?: WBSNode | null;
  parentNode?: WBSNode | null;
  siblings?: WBSNode[];
  isSubmitting?: boolean;
}

export function WBSFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editNode,
  parentNode,
  siblings = [],
  isSubmitting = false,
}: WBSFormDialogProps) {
  const isEdit = !!editNode;
  const isChild = !!parentNode;

  const form = useForm<WBSFormData>({
    resolver: zodResolver(wbsSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      parentId: null,
      weightage: 0,
      order: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (editNode) {
        // Edit mode
        form.reset({
          code: editNode.code,
          name: editNode.name,
          description: editNode.description || '',
          parentId: editNode.parentId || null,
          weightage: editNode.weightage,
          order: editNode.order,
        });
      } else {
        // Add mode
        const suggestedCode = parentNode 
          ? generateWBSCode(parentNode.code, siblings.length)
          : generateWBSCode(undefined, siblings.length);

        form.reset({
          code: suggestedCode,
          name: '',
          description: '',
          parentId: parentNode?.id || null,
          weightage: 0,
          order: siblings.length,
        });
      }
    }
  }, [open, editNode, parentNode, siblings, form]);

  const handleSubmit = async (data: WBSFormData) => {
    await onSubmit(data);
    form.reset();
  };

  const remainingWeightage = 100 - siblings
    .filter(s => s.id !== editNode?.id)
    .reduce((sum, s) => sum + s.weightage, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit WBS' : isChild ? 'Add Child WBS' : 'Add Root WBS'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Update the work breakdown structure element'
              : isChild
              ? `Add a child element under ${parentNode?.code} ${parentNode?.name}`
              : 'Add a new root level work breakdown structure'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* WBS Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WBS Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="1.1.1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Hierarchical code (e.g., 1.1.1, 2.3.1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* WBS Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WBS Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Site Preparation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Brief description of this work package..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weightage */}
            <FormField
              control={form.control}
              name="weightage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weightage (%) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="25.5"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {siblings.length > 0 && (
                      <span className={remainingWeightage < 0 ? 'text-red-600' : 'text-gray-600'}>
                        Remaining at this level: {Number(remainingWeightage).toFixed(2)}%
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order */}
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Display order within the same level
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
