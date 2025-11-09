import { TaskStatus } from '../api/tasks';

interface TaskFiltersProps {
  filter: TaskStatus | 'all';
  onFilterChange: (value: TaskStatus | 'all') => void;
  stats: Record<TaskStatus, number>;
}

export const TaskFilters = ({ filter, onFilterChange, stats }: TaskFiltersProps) => {
  const options: { value: TaskStatus | 'all'; label: string }[] = [
    { value: 'all', label: `Todas (${stats.pending + stats.in_progress + stats.done})` },
    { value: 'pending', label: `Pendientes (${stats.pending})` },
    { value: 'in_progress', label: `En progreso (${stats.in_progress})` },
    { value: 'done', label: `Completadas (${stats.done})` },
  ];

  return (
    <div className="filters" role="radiogroup" aria-label="Filtrar tareas por estado">
      {options.map((option) => (
        <label key={option.value} className={filter === option.value ? 'active' : ''}>
          <input
            type="radio"
            name="task-filter"
            value={option.value}
            checked={filter === option.value}
            onChange={() => onFilterChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};
