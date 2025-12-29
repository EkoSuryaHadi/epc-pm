'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { createApiMethods } from '@/lib/api-client';
import {
  projectSchema,
  type ProjectFormData,
  generateProjectCode,
  currencyOptions,
  statusOptions,
} from '@/lib/validations/project';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ProjectFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function ProjectForm({ initialData, isEdit = false }: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData ? {
      code: initialData.code,
      name: initialData.name,
      description: initialData.description || '',
      location: initialData.location || '',
      client: initialData.client || '',
      contractor: initialData.contractor || '',
      status: initialData.status,
      currency: initialData.currency,
      totalBudget: initialData.totalBudget,
      startDate: new Date(initialData.startDate),
      endDate: new Date(initialData.endDate),
    } : {
      code: generateProjectCode(),
      status: 'PLANNING',
      currency: 'USD',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);

      // Check if user is authenticated
      if (!session?.user?.accessToken) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: `You must be logged in to ${isEdit ? 'update' : 'create'} a project.`,
        });
        return;
      }
      
      // Format dates to ISO string for API
      const payload = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      };

      // Create API client with session token
      const api = createApiMethods(session.user.accessToken);
      
      if (isEdit && initialData?.id) {
        // Update existing project - only send allowed fields
        const updatePayload = {
          name: payload.name,
          description: payload.description,
          location: payload.location,
          totalBudget: payload.totalBudget,
          startDate: payload.startDate,
          endDate: payload.endDate,
        };
        await api.projects.update(initialData.id, updatePayload);
        toast({
          title: 'Success!',
          description: 'Project updated successfully.',
        });
      } else {
        // Create new project
        await api.projects.create(payload);
        toast({
          title: 'Success!',
          description: 'Project created successfully.',
        });
      }

      // Redirect to projects list
      router.push('/dashboard/projects');
    } catch (error: any) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} project:`, error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create project. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateCode = () => {
    form.setValue('code', generateProjectCode());
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Project' : 'Create New Project'}</CardTitle>
        <CardDescription>
          {isEdit 
            ? 'Update the project details below. All fields marked with * are required.'
            : 'Fill in the details below to create a new project. All fields marked with * are required.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Code *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="PRJ-ABC123" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateCode}
                    >
                      Generate
                    </Button>
                  </div>
                  <FormDescription>
                    Unique project identifier (uppercase, numbers, hyphens, underscores only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Project Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Oil & Gas Platform Construction" {...field} />
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
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Project overview and objectives..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Jakarta, Indonesia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client */}
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <Input placeholder="Client Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contractor */}
              <FormField
                control={form.control}
                name="contractor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractor</FormLabel>
                    <FormControl>
                      <Input placeholder="Contractor Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            date < new Date('1900-01-01')
                          }
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
                            date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Budget */}
              <FormField
                control={form.control}
                name="totalBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="10000000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Enter the total project budget</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting 
                  ? (isEdit ? 'Updating...' : 'Creating...') 
                  : (isEdit ? 'Update Project' : 'Create Project')
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
