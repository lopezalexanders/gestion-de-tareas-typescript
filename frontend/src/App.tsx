import { useTasks } from './hooks/useTasks';
import { TaskFilters } from './components/TaskFilters';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';

const App = () => {
  const { tasks, loading, error, filter, setFilter, stats, createTask, changeStatus } = useTasks();

  return (
    <div className="container">
      <header>
        <h1>Gestor de Tareas DevPro</h1>
        <p>Organiza el flujo de trabajo del equipo con un backlog simple.</p>
      </header>

      <TaskForm onSubmit={createTask} />

      <section className="card">
        <TaskFilters filter={filter} onFilterChange={setFilter} stats={stats} />
      </section>

      <section className="card">
        <header className="section-header">
          <h2>Listado de tareas</h2>
          {loading && <span className="badge">Cargando…</span>}
        </header>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <TaskList tasks={tasks} onStatusChange={changeStatus} />
      </section>
    </div>
  );
};

export default App;
