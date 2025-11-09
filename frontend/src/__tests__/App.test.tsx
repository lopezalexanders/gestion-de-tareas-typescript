import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import * as tasksApi from '../api/tasks';

const mockTasks: tasksApi.Task[] = [
  {
    id: '1',
    title: 'Inicial',
    description: 'Demo',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(tasksApi, 'fetchTasks').mockResolvedValue(mockTasks);
    vi.spyOn(tasksApi, 'createTask').mockResolvedValue(mockTasks[0]);
    vi.spyOn(tasksApi, 'updateTaskStatus').mockResolvedValue({ ...mockTasks[0], status: 'done' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders task list and allows creating a task', async () => {
    render(<App />);

    expect(await screen.findByText(/Inicial/)).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Título/i);
    await userEvent.type(titleInput, 'Nueva tarea');
    await userEvent.click(screen.getByRole('button', { name: /Crear tarea/i }));

    await waitFor(() => {
      expect(tasksApi.createTask).toHaveBeenCalled();
    });
  });
});
