import { ChangeEvent } from 'react';

import { TaskStatus } from '../api/tasks';

import type { Task } from '../api/tasks';

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'done', label: 'Completada' },
];

interface TaskListItemProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
}

export const TaskListItem = ({ task, onStatusChange }: TaskListItemProps) => {
  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    await onStatusChange(task.id, event.target.value as TaskStatus);
  };

  return (
    <li className="card">
      <header className="task-header">
        <h3>{task.title}</h3>
        <span className={`badge badge-${task.status}`}>{statusOptions.find((option) => option.value === task.status)?.label}</span>
      </header>
      {task.description && <p>{task.description}</p>}
      <footer className="task-footer">
        <small>
          Creada: {new Date(task.createdAt).toLocaleString()} | Actualizada: {new Date(task.updatedAt).toLocaleString()}
        </small>
        <label className="status-select">
          Estado
          <select value={task.status} onChange={handleChange}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </footer>
    </li>
  );
};
