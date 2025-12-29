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
  FormDescription,
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { scheduleTaskSchema, ScheduleTaskFormData, ScheduleTask, calculateDuration } from '@/lib/validations/schedule';
import { WBSNode } from '@/lib/validations/wbs';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ScheduleTaskFormData) => Promise<void>;
  initialData?: ScheduleTask | null;
  wbsNodes?: WBSNode[];
  allTasks?: ScheduleTask[];
  isLoading?: boolean;
}

export function TaskForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  wbsNodes = [],
  allTasks = [],
  isLoading = false,
}: TaskFormProps) {
  const form = useForm<ScheduleTaskFormData>({
    resolver: zodResolver(scheduleTaskSchema),
    defaultValues: {
      taskName: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      duration: 1,
      progress: 0,
      wbsId: '',
      predecessors: [],
      resources: [],
      plannedHours: null,
      actualHours: null,
      isCritical: false,
    },
  });

  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  // Auto-calculate duration when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const duration = calculateDuration(startDate, endDate);
      form.setValue('duration', duration);
    }
  }, [startDate, endDate, form]);

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          taskName: initialData.taskName,
          description: initialData.description || '',
          startDate: new Date(initialData.startDate),
          endDate: new Date(initialData.endDate),
          duration: initialData.duration,
          progress: initialData.progress,
          wbsId: initialData.wbsId || '',
          predecessors: initialData.predecessors || [],
          resources: initialData.resources || [],
          plannedHours: initialData.plannedHours,
          actualHours: initialData.actualHours,
          isCritical: initialData.isCritical,
        });
      } else {
        form.reset({
          taskName: '',
          description: '',
          startDate: new Date(),
          endDate: new Date(),
          duration: 1,
          progress: 0,
          wbsId: '',
          predecessors: [],
          resources: [],
          plannedHours: null,
          actualHours: null,
          isCritical: false,
        });
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: ScheduleTaskFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Filter out current task from predecessor options (can't depend on itself)
  const availablePredecessors = allTasks.filter(
    (task) => !initialData || task.id !== initialData.id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Schedule Task' : 'Add New Task'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the task details below.'
              : 'Enter the details for the new schedule task.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Task Name */}
            <FormField
              control={form.control}
              name="taskName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Design Phase" {...field} />
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
                      placeholder="Optional task description..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal',
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal',
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration (auto-calculated) */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} readOnly className="bg-gray-50" />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Auto-calculated
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Progress */}
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* WBS Link */}
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

            <div className="grid grid-cols-2 gap-4">
              {/* Planned Hours */}
              <FormField
                control={form.control}
                name="plannedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actual Hours */}
              <FormField
                control={form.control}
                name="actualHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Resources (comma-separated for now) */}
            <FormField
              control={form.control}
              name="resources"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resources</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., John Doe, Jane Smith (comma-separated)"
                      value={field.value.join(', ')}
                      onChange={(e) => {
                        const resources = e.target.value
                          .split(',')
                          .map((r) => r.trim())
                          .filter((r) => r.length > 0);
                        field.onChange(resources);
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Enter resource names separated by commas
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
