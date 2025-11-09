import { useCallback, useEffect, useMemo, useState } from 'react';

import { Task, TaskStatus, createTask, fetchTasks, updateTaskStatus } from '../api/tasks';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks(filter === 'all' ? undefined : filter);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = useCallback(
    async (payload: { title: string; description?: string }) => {
      await createTask(payload);
      await loadTasks();
    },
    [loadTasks],
  );

  const handleStatusChange = useCallback(
    async (id: string, status: TaskStatus) => {
      await updateTaskStatus(id, status);
      await loadTasks();
    },
    [loadTasks],
  );

  const stats = useMemo(() => {
    return tasks.reduce<Record<TaskStatus, number>>(
      (acc, task) => {
        acc[task.status] += 1;
        return acc;
      },
      { pending: 0, in_progress: 0, done: 0 },
    );
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    filter,
    setFilter,
    stats,
    createTask: handleCreateTask,
    changeStatus: handleStatusChange,
  };
};
