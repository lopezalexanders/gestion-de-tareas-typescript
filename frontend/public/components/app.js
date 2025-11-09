import { createTask, listTasks, updateTaskStatus } from '../api/tasks';
export class App {
    constructor(container) {
        this.container = container;
        this.renderSkeleton();
        void this.loadTasks();
    }
    renderSkeleton() {
        this.container.innerHTML = '';
        const form = document.createElement('form');
        form.innerHTML = `
      <label>
        Título
        <input name="title" type="text" required maxlength="120" placeholder="Ej. Preparar demo" />
      </label>
      <label>
        Descripción
        <textarea name="description" rows="3" maxlength="2000" placeholder="Detalles opcionales"></textarea>
      </label>
      <label>
        Estado inicial
        <select name="status">
          <option value="pending" selected>Pendiente</option>
          <option value="in_progress">En progreso</option>
          <option value="done">Completada</option>
        </select>
      </label>
      <button type="submit">Crear tarea</button>
    `;
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const payload = {
                title: String(formData.get('title') ?? ''),
                description: String(formData.get('description') ?? ''),
                status: String(formData.get('status') ?? 'pending'),
            };
            void this.handleCreateTask(payload, form);
        });
        this.alertBox = document.createElement('div');
        const filters = document.createElement('div');
        filters.className = 'filters';
        filters.innerHTML = `
      <select name="statusFilter">
        <option value="">Todos los estados</option>
        <option value="pending">Pendiente</option>
        <option value="in_progress">En progreso</option>
        <option value="done">Completada</option>
      </select>
      <input type="search" name="search" placeholder="Buscar por título o descripción" />
      <button type="button">Aplicar filtros</button>
    `;
        this.statusFilter = filters.querySelector('select') ?? undefined;
        this.searchInput = filters.querySelector('input') ?? undefined;
        const filterButton = filters.querySelector('button');
        filterButton?.addEventListener('click', () => {
            void this.loadTasks();
        });
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        tableContainer.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;
        this.tasksTable = tableContainer.querySelector('tbody') ?? undefined;
        this.container.append(form, this.alertBox, filters, tableContainer);
    }
    async loadTasks() {
        try {
            const status = this.statusFilter?.value || undefined;
            const q = this.searchInput?.value || undefined;
            const data = await listTasks({ status, q });
            this.renderTasks(data);
            this.showAlert('success', `Se encontraron ${data.total} tareas.`);
        }
        catch (error) {
            this.showAlert('error', error.message);
        }
    }
    renderTasks(data) {
        if (!this.tasksTable)
            return;
        this.tasksTable.innerHTML = '';
        if (data.items.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.textContent = 'No hay tareas registradas.';
            row.appendChild(cell);
            this.tasksTable.appendChild(row);
            return;
        }
        data.items.forEach((task) => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${task.title}</td>
        <td>${task.description ?? '-'}</td>
        <td><span class="status-tag status-${task.status}">${this.translateStatus(task.status)}</span></td>
        <td></td>
      `;
            const actionsCell = row.querySelector('td:last-child');
            if (actionsCell) {
                const select = document.createElement('select');
                ['pending', 'in_progress', 'done'].forEach((status) => {
                    const option = document.createElement('option');
                    option.value = status;
                    option.textContent = this.translateStatus(status);
                    option.selected = status === task.status;
                    select.appendChild(option);
                });
                select.addEventListener('change', () => {
                    void this.handleStatusChange(task, select.value);
                });
                actionsCell.appendChild(select);
            }
            this.tasksTable?.appendChild(row);
        });
    }
    async handleCreateTask(payload, form) {
        try {
            await createTask({
                title: payload.title,
                description: payload.description ?? undefined,
                status: payload.status,
            });
            form.reset();
            this.showAlert('success', 'Tarea creada correctamente.');
            await this.loadTasks();
        }
        catch (error) {
            this.showAlert('error', error.message);
        }
    }
    async handleStatusChange(task, status) {
        if (status === task.status) {
            return;
        }
        try {
            await updateTaskStatus(task.id, status);
            this.showAlert('success', 'Estado actualizado correctamente.');
            await this.loadTasks();
        }
        catch (error) {
            this.showAlert('error', error.message);
            await this.loadTasks();
        }
    }
    showAlert(type, message) {
        if (!this.alertBox)
            return;
        this.alertBox.className = 'alert';
        if (type === 'success') {
            this.alertBox.classList.add('alert-success');
        }
        else if (type === 'error') {
            this.alertBox.classList.add('alert-error');
        }
        this.alertBox.textContent = message;
    }
    translateStatus(status) {
        switch (status) {
            case 'pending':
                return 'Pendiente';
            case 'in_progress':
                return 'En progreso';
            case 'done':
                return 'Completada';
            default:
                return status;
        }
    }
}
