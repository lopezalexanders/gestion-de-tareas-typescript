import { TaskStatus } from '../api/tasks';

import { TaskListItem } from './TaskListItem';

import type { Task } from '../api/tasks';

interface TaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
}

export const TaskList = ({ tasks, onStatusChange }: TaskListProps) => {
  if (!tasks.length) {
    return <p>No hay tareas registradas aún.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskListItem key={task.id} task={task} onStatusChange={onStatusChange} />
      ))}
    </ul>
  );
};
