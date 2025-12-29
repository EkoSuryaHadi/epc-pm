'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { riskSchema, type RiskFormData, type Risk, RISK_CATEGORIES, RISK_STATUSES, calculateRiskScore, getRiskLevel } from '@/lib/validations/risk';
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
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface RiskFormProps {
  risk?: Risk | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RiskFormData) => void;
  isSubmitting?: boolean;
}

export function RiskForm({ risk, open, onClose, onSubmit, isSubmitting }: RiskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RiskFormData>({
    resolver: zodResolver(riskSchema),
    defaultValues: risk || {
      status: 'IDENTIFIED',
      probability: 3,
      impact: 3,
    },
  });

  const category = watch('category');
  const probability = watch('probability');
  const impact = watch('impact');
  const status = watch('status');

  // Calculate risk score whenever probability or impact changes
  const riskScore = probability && impact ? calculateRiskScore(probability, impact) : 0;
  const riskLevel = getRiskLevel(riskScore);

  useEffect(() => {
    if (risk) {
      reset(risk);
    } else {
      reset({
        status: 'IDENTIFIED',
        probability: 3,
        impact: 3,
      });
    }
  }, [risk, reset]);

  const handleFormSubmit = (data: RiskFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{risk ? 'Edit Risk' : 'Add New Risk'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Risk Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Delay in material delivery"
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
              placeholder="Detailed description of the risk"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Category and Owner */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {RISK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="owner">Risk Owner *</Label>
              <Input
                id="owner"
                {...register('owner')}
                placeholder="Person responsible"
              />
              {errors.owner && (
                <p className="text-sm text-red-500 mt-1">{errors.owner.message}</p>
              )}
            </div>
          </div>

          {/* Probability and Impact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="probability">Probability (1-5) *</Label>
              <Select 
                value={probability?.toString()} 
                onValueChange={(value) => setValue('probability', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select probability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low (0-10%)</SelectItem>
                  <SelectItem value="2">2 - Low (10-30%)</SelectItem>
                  <SelectItem value="3">3 - Medium (30-50%)</SelectItem>
                  <SelectItem value="4">4 - High (50-70%)</SelectItem>
                  <SelectItem value="5">5 - Very High (70-100%)</SelectItem>
                </SelectContent>
              </Select>
              {errors.probability && (
                <p className="text-sm text-red-500 mt-1">{errors.probability.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="impact">Impact (1-5) *</Label>
              <Select 
                value={impact?.toString()} 
                onValueChange={(value) => setValue('impact', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Insignificant</SelectItem>
                  <SelectItem value="2">2 - Minor</SelectItem>
                  <SelectItem value="3">3 - Moderate</SelectItem>
                  <SelectItem value="4">4 - Major</SelectItem>
                  <SelectItem value="5">5 - Catastrophic</SelectItem>
                </SelectContent>
              </Select>
              {errors.impact && (
                <p className="text-sm text-red-500 mt-1">{errors.impact.message}</p>
              )}
            </div>
          </div>

          {/* Risk Score Display */}
          {probability && impact && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Risk Score</p>
                  <p className="text-3xl font-bold">{riskScore}</p>
                  <p className="text-sm text-gray-500">
                    {probability} × {impact} = {riskScore}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={`bg-${riskLevel.color}-100 text-${riskLevel.color}-800`}>
                    {riskLevel.label}
                  </Badge>
                  {riskScore >= 15 && (
                    <div className="flex items-center gap-1 text-red-600 mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Immediate action required!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: any) => setValue('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {RISK_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mitigation */}
          <div>
            <Label htmlFor="mitigation">Mitigation Strategy</Label>
            <Textarea
              id="mitigation"
              {...register('mitigation')}
              placeholder="Actions to reduce probability or impact"
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
              {isSubmitting ? 'Saving...' : risk ? 'Update Risk' : 'Add Risk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
