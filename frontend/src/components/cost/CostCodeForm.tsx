'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { costCodeSchema, CostCodeFormData, CostCode, COST_CATEGORIES } from '@/lib/validations/cost-code';
import { WBSNode } from '@/lib/validations/wbs';

interface CostCodeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CostCodeFormData) => Promise<void>;
  initialData?: CostCode | null;
  wbsNodes?: WBSNode[];
  isLoading?: boolean;
}

export function CostCodeForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  wbsNodes = [],
  isLoading = false,
}: CostCodeFormProps) {
  const form = useForm<CostCodeFormData>({
    resolver: zodResolver(costCodeSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      category: 'MATERIAL',
      budget: 0,
      wbsId: '',
    },
  });

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          code: initialData.code,
          name: initialData.name,
          description: initialData.description || '',
          category: initialData.category as any,
          budget: initialData.budget,
          wbsId: initialData.wbsId || '',
        });
      } else {
        form.reset({
          code: '',
          name: '',
          description: '',
          category: 'MATERIAL',
          budget: 0,
          wbsId: '',
        });
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: CostCodeFormData) => {
    try {
      // Convert empty string to null for wbsId
      const submitData = {
        ...data,
        wbsId: data.wbsId || null,
      };
      await onSubmit(submitData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Cost Code' : 'Add New Cost Code'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the cost code details below.'
              : 'Enter the details for the new cost code.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MAT-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COST_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Steel Pipes" {...field} />
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
                    <Textarea
                      placeholder="Optional description..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Budget */}
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* WBS */}
              <FormField
                control={form.control}
                name="wbsId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to WBS (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                      defaultValue={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select WBS" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {wbsNodes.map((wbs) => (
                          <SelectItem key={wbs.id} value={wbs.id}>
                            {wbs.code} - {wbs.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
