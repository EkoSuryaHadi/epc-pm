'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changeOrderSchema, type ChangeOrderFormData, type ChangeOrder, CHANGE_ORDER_TYPES, CHANGE_ORDER_STATUSES } from '@/lib/validations/risk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ChangeOrderFormProps {
  changeOrder?: ChangeOrder | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ChangeOrderFormData) => void;
  isSubmitting?: boolean;
}

export function ChangeOrderForm({ changeOrder, open, onClose, onSubmit, isSubmitting }: ChangeOrderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ChangeOrderFormData>({
    resolver: zodResolver(changeOrderSchema),
    defaultValues: changeOrder || {
      status: 'PENDING',
      type: 'SCOPE',
      costImpact: 0,
      timeImpact: 0,
    },
  });

  const type = watch('type');
  const status = watch('status');
  const costImpact = watch('costImpact');
  const timeImpact = watch('timeImpact');

  useEffect(() => {
    if (changeOrder) {
      reset(changeOrder);
    } else {
      reset({
        status: 'PENDING',
        type: 'SCOPE',
        costImpact: 0,
        timeImpact: 0,
      });
    }
  }, [changeOrder, reset]);

  const handleFormSubmit = (data: ChangeOrderFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  const getTypeIcon = (typeValue: string) => {
    const typeConfig = CHANGE_ORDER_TYPES.find((t) => t.value === typeValue);
    return typeConfig?.icon || '📝';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{changeOrder ? 'Edit Change Order' : 'Create Change Order'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Change Order Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Additional scope for fire safety system"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed description of the change"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Change Type *</Label>
              <Select value={type} onValueChange={(value: any) => setValue('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CHANGE_ORDER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {CHANGE_ORDER_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Impact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costImpact">Cost Impact (USD)</Label>
              <Input
                id="costImpact"
                type="number"
                step="0.01"
                {...register('costImpact', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.costImpact && (
                <p className="text-sm text-red-500 mt-1">{errors.costImpact.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="timeImpact">Time Impact (Days)</Label>
              <Input
                id="timeImpact"
                type="number"
                {...register('timeImpact', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.timeImpact && (
                <p className="text-sm text-red-500 mt-1">{errors.timeImpact.message}</p>
              )}
            </div>
          </div>

          {/* Impact Summary */}
          {(costImpact !== 0 || timeImpact !== 0) && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">Impact Summary:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Cost Impact:</span>
                  <p className={`font-bold ${costImpact > 0 ? 'text-red-600' : costImpact < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    ${Math.abs(costImpact || 0).toLocaleString()} {costImpact > 0 ? 'increase' : costImpact < 0 ? 'savings' : ''}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Time Impact:</span>
                  <p className={`font-bold ${timeImpact > 0 ? 'text-red-600' : timeImpact < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {Math.abs(timeImpact || 0)} days {timeImpact > 0 ? 'delay' : timeImpact < 0 ? 'acceleration' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Requested By and Approved By */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requestedBy">Requested By *</Label>
              <Input
                id="requestedBy"
                {...register('requestedBy')}
                placeholder="Name of requestor"
              />
              {errors.requestedBy && (
                <p className="text-sm text-red-500 mt-1">{errors.requestedBy.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="approvedBy">Approved By</Label>
              <Input
                id="approvedBy"
                {...register('approvedBy')}
                placeholder="Name of approver (if approved)"
              />
            </div>
          </div>

          {/* Justification */}
          <div>
            <Label htmlFor="justification">Justification</Label>
            <Textarea
              id="justification"
              {...register('justification')}
              placeholder="Reason for the change"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : changeOrder ? 'Update Change Order' : 'Create Change Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
