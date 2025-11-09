# Gestor de Tareas DevPro (MVP)

Implementación mínima del backend y frontend descritos en `Especificacion_SDD_IA_DevPro_Tasks.md`.

## Backend

Ubicación: [`backend/`](backend/)

### Requisitos
- Node.js 18+
- `sqlite3` CLI disponible en el sistema

### Scripts
- `npm run build`: compila los archivos TypeScript a `dist/`.
- `npm start`: inicia el servidor HTTP.

### Variables de entorno
- `PORT`: puerto del servidor (por defecto `3000`).
- `ALLOWED_ORIGIN`: origen permitido para CORS (por defecto `http://localhost:5173`).
- `DB_PATH`: ruta del archivo SQLite (por defecto `./data/devpro-tasks.sqlite`).
- `RATE_LIMIT_MAX`: número de solicitudes permitidas por ventana (por defecto `100`).
- `RATE_LIMIT_WINDOW_MS`: duración de la ventana de rate limit en milisegundos (por defecto `300000`).

### Rutas expuestas
- `GET /health`: healthcheck.
- `GET /metrics`: métrica básica de solicitudes.
- `POST /tasks`: crea una tarea.
- `GET /tasks`: lista tareas (filtros `status`, `q`).
- `PUT /tasks/:id/status`: actualiza el estado de una tarea.

## Frontend

Ubicación: [`frontend/`](frontend/)

Aplicación estática sin dependencias externas. Consume la API del backend y permite crear, listar y actualizar el estado de las tareas.

### Scripts
- `npm run build`: compila TypeScript a `public/`.

### Uso
1. Ejecutar el backend (`npm run build && npm start` en `backend/`).
2. Servir la carpeta `frontend/public/` con cualquier servidor estático (por ejemplo `npx http-server frontend/public`).
3. Abrir `http://localhost:8080` (o el puerto que utilice el servidor estático).

Para apuntar a otra URL de API, definir `window.__API_BASE__` antes de cargar `main.js`.

## Contrato OpenAPI
La especificación se encuentra en [`backend/openapi/devpro-tasks.yaml`](backend/openapi/devpro-tasks.yaml).
