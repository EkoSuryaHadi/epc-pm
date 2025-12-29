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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { costEntrySchema, CostEntryFormData, ENTRY_TYPES } from '@/lib/validations/cost-entry';
import { CostCode } from '@/lib/validations/cost-code';

interface CostEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CostEntryFormData) => Promise<void>;
  costCodes?: CostCode[];
  isLoading?: boolean;
}

export function CostEntryForm({
  open,
  onOpenChange,
  onSubmit,
  costCodes = [],
  isLoading = false,
}: CostEntryFormProps) {
  const form = useForm<CostEntryFormData>({
    resolver: zodResolver(costEntrySchema),
    defaultValues: {
      costCodeId: '',
      description: '',
      amount: 0,
      entryDate: new Date(),
      entryType: 'ACTUAL',
      reference: '',
    },
  });

  const selectedCostCodeId = form.watch('costCodeId');
  const selectedCostCode = costCodes.find(cc => cc.id === selectedCostCodeId);
  const amount = form.watch('amount');

  // Calculate if amount exceeds budget
  const exceedsBudget = selectedCostCode && amount > selectedCostCode.budget;
  const budgetPercent = selectedCostCode 
    ? ((amount / selectedCostCode.budget) * 100).toFixed(1)
    : '0';

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        costCodeId: '',
        description: '',
        amount: 0,
        entryDate: new Date(),
        entryType: 'ACTUAL',
        reference: '',
      });
    }
  }, [open, form]);

  const handleSubmit = async (data: CostEntryFormData) => {
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
          <DialogTitle>Add Cost Entry</DialogTitle>
          <DialogDescription>
            Record a cost transaction for this project.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Cost Code */}
              <FormField
                control={form.control}
                name="costCodeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Code *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cost code" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {costCodes.map((costCode) => (
                          <SelectItem key={costCode.id} value={costCode.id}>
                            {costCode.code} - {costCode.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Entry Type */}
              <FormField
                control={form.control}
                name="entryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ENTRY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter transaction description..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    {selectedCostCode && (
                      <div className="text-xs mt-1">
                        <div className="text-muted-foreground">
                          Budget: ${selectedCostCode.budget.toLocaleString()}
                        </div>
                        {exceedsBudget && (
                          <div className="text-amber-600 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            Exceeds budget by {budgetPercent}%
                          </div>
                        )}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Entry Date */}
              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Entry Date *</FormLabel>
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
            </div>

            {/* Reference */}
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., INV-001, PO-123"
                      {...field}
                    />
                  </FormControl>
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
                Create Entry
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
