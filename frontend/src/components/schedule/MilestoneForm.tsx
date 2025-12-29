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
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Flag } from 'lucide-react';
import { milestoneSchema, MilestoneFormData, Milestone } from '@/lib/validations/milestone';

interface MilestoneFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MilestoneFormData) => Promise<void>;
  initialData?: Milestone | null;
  isLoading?: boolean;
}

export function MilestoneForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: MilestoneFormProps) {
  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      name: '',
      description: '',
      targetDate: new Date(),
      actualDate: null,
      status: 'Pending',
      critical: false,
    },
  });

  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          description: initialData.description || '',
          targetDate: new Date(initialData.targetDate),
          actualDate: initialData.actualDate ? new Date(initialData.actualDate) : null,
          status: initialData.status,
          critical: initialData.critical,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          targetDate: new Date(),
          actualDate: null,
          status: 'Pending',
          critical: false,
        });
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: MilestoneFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            {initialData ? 'Edit Milestone' : 'Add New Milestone'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the milestone details below.'
              : 'Create a new milestone to track important project events.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Milestone Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Milestone Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Project Kickoff, Phase 1 Complete" {...field} />
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
                      placeholder="Optional description of the milestone..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Target Date */}
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Target Date *</FormLabel>
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

              {/* Actual Date */}
              <FormField
                control={form.control}
                name="actualDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Actual Date</FormLabel>
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
                              <span>Not achieved yet</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-xs">
                      Leave empty if not achieved
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Achieved">Achieved</SelectItem>
                        <SelectItem value="Delayed">Delayed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Critical Milestone */}
              <FormField
                control={form.control}
                name="critical"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Critical Milestone
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Mark as critical for priority tracking
                      </FormDescription>
                    </div>
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
