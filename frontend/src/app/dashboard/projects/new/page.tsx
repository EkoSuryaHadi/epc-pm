import { ProjectForm } from '@/components/projects/ProjectForm';

export default function NewProjectPage() {
  return (
    <div className="container max-w-7xl py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
        <p className="text-muted-foreground">
          Create a new project to start tracking costs, schedule, and progress.
        </p>
      </div>

      <ProjectForm />
    </div>
  );
}
