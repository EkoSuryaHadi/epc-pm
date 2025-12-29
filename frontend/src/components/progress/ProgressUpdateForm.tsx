'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  progressUpdateSchema,
  ProgressUpdateFormData,
  ProgressUpdate,
} from '@/lib/validations/progress';
import { WBSNode } from '@/lib/validations/wbs';

interface ProgressUpdateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProgressUpdateFormData) => Promise<void>;
  initialData?: ProgressUpdate | null;
  wbsNodes: WBSNode[];
  projectId: string;
  isLoading?: boolean;
}

export function ProgressUpdateForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  wbsNodes,
  projectId,
  isLoading = false,
}: ProgressUpdateFormProps) {
  const form = useForm<ProgressUpdateFormData>({
    resolver: zodResolver(progressUpdateSchema),
    defaultValues: {
      projectId,
      wbsId: '',
      reportDate: new Date(),
      physicalProgress: 0,
      plannedProgress: 0,
      manhours: null,
      remarks: '',
    },
  });

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      form.reset({
        projectId: initialData.projectId,
        wbsId: initialData.wbsId,
        reportDate: new Date(initialData.reportDate),
        physicalProgress: Number(initialData.physicalProgress),
        plannedProgress: Number(initialData.plannedProgress),
        manhours: initialData.manhours ? Number(initialData.manhours) : null,
        remarks: initialData.remarks || '',
      });
    } else {
      form.reset({
        projectId,
        wbsId: '',
        reportDate: new Date(),
        physicalProgress: 0,
        plannedProgress: 0,
        manhours: null,
        remarks: '',
      });
    }
  }, [initialData, projectId, form]);

  const handleSubmit = async (data: ProgressUpdateFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Progress Update' : 'Add Progress Update'}
          </DialogTitle>
          <DialogDescription>
            Record progress update for a WBS element. All fields are required unless marked
            optional.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* WBS Selection */}
            <FormField
              control={form.control}
              name="wbsId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WBS Element *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select WBS element" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wbsNodes.map((wbs) => (
                        <SelectItem key={wbs.id} value={wbs.id}>
                          {wbs.code} - {wbs.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the work breakdown structure element for this update
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Report Date */}
            <FormField
              control={form.control}
              name="reportDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Report Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Date when this progress was measured
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Progress Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="physicalProgress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Progress (%) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Actual progress achieved (0-100%)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedProgress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned Progress (%) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Expected progress by this date (0-100%)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Variance Display */}
            {form.watch('physicalProgress') !== undefined &&
              form.watch('plannedProgress') !== undefined && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="text-sm font-medium">Progress Variance</div>
                  <div
                    className={cn(
                      'text-2xl font-bold',
                      form.watch('physicalProgress') - form.watch('plannedProgress') >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {(
                      form.watch('physicalProgress') - form.watch('plannedProgress')
                    ).toFixed(2)}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {form.watch('physicalProgress') - form.watch('plannedProgress') >= 0
                      ? 'Ahead of plan'
                      : 'Behind plan'}
                  </div>
                </div>
              )}

            {/* Manhours */}
            <FormField
              control={form.control}
              name="manhours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manhours (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Total manhours spent to achieve this progress
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any comments or notes about this progress update..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional comments or observations
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
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
                {initialData ? 'Update' : 'Create'} Progress Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
