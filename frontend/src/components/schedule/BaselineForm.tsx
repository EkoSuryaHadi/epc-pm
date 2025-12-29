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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Camera, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { baselineSchema, BaselineFormData } from '@/lib/validations/baseline';

interface BaselineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BaselineFormData) => Promise<void>;
  taskCount: number;
  isLoading?: boolean;
}

export function BaselineForm({
  open,
  onOpenChange,
  onSubmit,
  taskCount,
  isLoading = false,
}: BaselineFormProps) {
  const form = useForm<BaselineFormData>({
    resolver: zodResolver(baselineSchema),
    defaultValues: {
      name: '',
      description: '',
      setAsActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        description: '',
        setAsActive: true,
      });
    }
  }, [open, form]);

  const handleSubmit = async (data: BaselineFormData) => {
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Create Schedule Baseline
          </DialogTitle>
          <DialogDescription>
            Capture the current schedule as a baseline for tracking progress and variance.
          </DialogDescription>
        </DialogHeader>

        {taskCount === 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No schedule tasks found. Please create schedule tasks before creating a baseline.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will capture <strong>{taskCount} schedule task{taskCount !== 1 ? 's' : ''}</strong> as baseline data.
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {/* Baseline Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseline Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Initial Baseline, Re-baseline v2"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A descriptive name to identify this baseline
                      </FormDescription>
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Reason for creating this baseline..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Document why this baseline is being created
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Set as Active */}
                <FormField
                  control={form.control}
                  name="setAsActive"
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
                          Set as Active Baseline
                        </FormLabel>
                        <FormDescription>
                          Use this baseline for variance calculations and reports
                        </FormDescription>
                      </div>
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
                  <Button type="submit" disabled={isLoading || taskCount === 0}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Baseline
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
