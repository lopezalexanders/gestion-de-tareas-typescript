import { FormEvent, useState } from 'react';

interface TaskFormProps {
  onSubmit: (payload: { title: string; description?: string }) => Promise<void>;
}

export const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ title, description: description.trim() || undefined });
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} aria-label="Crear tarea">
      <h2>Crear nueva tarea</h2>
      <label>
        Título
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Implementar feature"
          maxLength={120}
          required
        />
      </label>
      <label>
        Descripción
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Detalles adicionales"
          maxLength={2000}
        />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Guardando…' : 'Crear tarea'}
      </button>
    </form>
  );
};
