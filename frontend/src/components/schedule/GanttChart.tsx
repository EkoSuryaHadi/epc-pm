'use client';

import { useState, useMemo } from 'react';
import { Gantt, Task, ViewMode as GanttViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { ScheduleTask } from '@/lib/validations/schedule';
import { Milestone } from '@/lib/validations/milestone';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GanttChartProps {
  tasks: ScheduleTask[];
  milestones?: Milestone[];
  onTaskClick?: (task: ScheduleTask) => void;
  onTaskUpdate?: (task: ScheduleTask, startDate: string, endDate: string) => void;
  onMilestoneClick?: (milestone: Milestone) => void;
}

type ViewMode = 'Hour' | 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month';

export function GanttChart({ tasks, milestones = [], onTaskClick, onTaskUpdate, onMilestoneClick }: GanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('Day');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [showMilestones, setShowMilestones] = useState(true);

  // Transform tasks to Gantt format
  const ganttTasks: Task[] = useMemo(() => {
    const filteredTasks = showCriticalOnly 
      ? tasks.filter(t => t.isCritical) 
      : tasks;

    const taskItems: Task[] = filteredTasks.map((task) => ({
      start: new Date(task.startDate),
      end: new Date(task.endDate),
      name: task.taskName,
      id: task.id,
      type: 'task' as const,
      progress: task.progress,
      isDisabled: false,
      styles: {
        backgroundColor: task.isCritical ? '#ef4444' : '#3b82f6',
        backgroundSelectedColor: task.isCritical ? '#dc2626' : '#2563eb',
        progressColor: task.isCritical ? '#991b1b' : '#1e40af',
        progressSelectedColor: task.isCritical ? '#7f1d1d' : '#1e3a8a',
      },
      project: task.wbs?.code || undefined,
    }));

    // Add milestones as milestone-type tasks (zero duration)
    if (showMilestones && milestones.length > 0) {
      const milestoneItems: Task[] = milestones.map((milestone) => {
        const targetDate = new Date(milestone.targetDate);
        return {
          start: targetDate,
          end: targetDate, // Same as start for milestone (zero duration)
          name: `◆ ${milestone.name}`,
          id: `milestone-${milestone.id}`,
          type: 'milestone' as const,
          progress: milestone.status === 'Achieved' ? 100 : 0,
          isDisabled: false,
          styles: {
            backgroundColor: milestone.critical ? '#ef4444' : '#a855f7',
            backgroundSelectedColor: milestone.critical ? '#dc2626' : '#9333ea',
            progressColor: milestone.critical ? '#991b1b' : '#7c3aed',
            progressSelectedColor: milestone.critical ? '#7f1d1d' : '#6b21a8',
          },
        };
      });
      return [...taskItems, ...milestoneItems];
    }

    return taskItems;
  }, [tasks, milestones, showCriticalOnly, showMilestones]);

  // Handle task/milestone click
  const handleTaskClick = (task: Task) => {
    // Check if it's a milestone
    if (task.id.startsWith('milestone-')) {
      const milestoneId = task.id.replace('milestone-', '');
      const originalMilestone = milestones.find((m) => m.id === milestoneId);
      if (originalMilestone && onMilestoneClick) {
        onMilestoneClick(originalMilestone);
      }
      return;
    }

    // Handle regular task click
    const originalTask = tasks.find((t) => t.id === task.id);
    if (originalTask && onTaskClick) {
      onTaskClick(originalTask);
    }
  };

  // Handle task date change
  const handleTaskChange = (task: Task) => {
    const originalTask = tasks.find((t) => t.id === task.id);
    if (originalTask && onTaskUpdate) {
      onTaskUpdate(
        originalTask,
        task.start.toISOString(),
        task.end.toISOString()
      );
    }
  };

  if (ganttTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-600 font-medium">No tasks to display</p>
          <p className="text-gray-500 text-sm mt-1">
            Add schedule tasks to see them in the Gantt chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">View Mode:</label>
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hour">Hour</SelectItem>
                <SelectItem value="Quarter Day">Quarter Day</SelectItem>
                <SelectItem value="Half Day">Half Day</SelectItem>
                <SelectItem value="Day">Day</SelectItem>
                <SelectItem value="Week">Week</SelectItem>
                <SelectItem value="Month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="criticalOnly"
              checked={showCriticalOnly}
              onChange={(e) => setShowCriticalOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="criticalOnly" className="text-sm font-medium cursor-pointer">
              Show Critical Path Only
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showMilestones"
              checked={showMilestones}
              onChange={(e) => setShowMilestones(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="showMilestones" className="text-sm font-medium cursor-pointer">
              Show Milestones
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Regular Task</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Critical Task</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Milestone</span>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-lg border">
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode as GanttViewMode}
          onClick={handleTaskClick}
          onDateChange={handleTaskChange}
          listCellWidth="155px"
          columnWidth={viewMode === 'Month' ? 300 : viewMode === 'Week' ? 250 : 65}
          barBackgroundColor="#3b82f6"
          barBackgroundSelectedColor="#2563eb"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Tasks</div>
          <div className="text-2xl font-bold">
            {showCriticalOnly 
              ? tasks.filter(t => t.isCritical).length 
              : tasks.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Critical Tasks</div>
          <div className="text-2xl font-bold text-red-600">
            {tasks.filter((t) => t.isCritical).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {tasks.filter((t) => t.progress === 100).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">
            {tasks.filter((t) => t.progress > 0 && t.progress < 100).length}
          </div>
        </div>
      </div>
    </div>
  );
}
