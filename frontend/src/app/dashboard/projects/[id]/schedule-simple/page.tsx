'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { createApiMethods } from '@/lib/api-client';

export default function ScheduleSimplePage() {
  const params = useParams();
  const { data: session } = useSession();
  const projectId = params.id as string;

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!session?.user?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const api = createApiMethods(session.user.accessToken);
        const response = await api.schedule.getAll(projectId);
        setTasks(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [session, projectId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Schedule Tasks (Simple)</h1>
      <p className="mb-4">Found {tasks.length} tasks</p>
      
      <div className="border rounded">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Task Name</th>
              <th className="px-4 py-2 text-left">Start Date</th>
              <th className="px-4 py-2 text-left">End Date</th>
              <th className="px-4 py-2 text-left">Progress</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t">
                <td className="px-4 py-2">{task.taskName}</td>
                <td className="px-4 py-2">{new Date(task.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{new Date(task.endDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{task.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
