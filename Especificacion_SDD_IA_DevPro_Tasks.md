# Especificación única (Spec-Driven Development + IA)

**Producto:** MVP Gestor de Tareas – DevPro Bolivia  
**Versión:** 1.0 (estado: propuesta)  
**Propósito:** Servir como **fuente única de verdad** para el agente de IA y el equipo de desarrollo. Toda decisión de diseño/código/pruebas debe trazarse a esta especificación.  
**Autores:** Equipo Arquitectura/IA  
**Fecha:** 2025-11-07  

---

## 1. Contexto y objetivos
- **Contexto:** La gestión actual de tareas en DevPro Bolivia es informal; hay cuellos de botella y baja trazabilidad.
- **Objetivo del MVP:** Implementar un **gestor de tareas simple** que permita crear, listar y actualizar el estado de tareas, demostrando el enfoque **Spec‑Driven Development asistido por IA** con TypeScript, REST y principios SOLID.

**Resultados esperados:**
- Trazabilidad desde especificaciones → contratos → código → pruebas → despliegue.
- Base técnica limpia (MVC, SRP, asincronía) para escalar funciones futuras (usuarios, permisos, reportes, métricas).

---

## 2. Alcance
**En alcance (MVP):**
- Crear tarea con `title`, `description`, `status` inicial `pending`.
- Listar tareas.
- Actualizar `status` de una tarea a `in_progress` o `done`.

**Fuera de alcance (MVP, pero previsto a futuro):**
- Gestión de usuarios y autenticación real (se deja **placeholder**).
- Borrado de tareas, comentarios, adjuntos, prioridades, etiquetas, fechas límite.
- Notificaciones, auditoría avanzada, autorización por roles.

---

## 3. Reglas de negocio
- **Estados válidos de una tarea:** `pending` (por defecto), `in_progress`, `done`.
- **Transiciones permitidas:**
  - `pending` → `in_progress` | `done`
  - `in_progress` → `done`
  - `done` → *(sin transición hacia atrás en MVP)*
- **Campos obligatorios al crear:** `title` (1..120 chars), `description` (0..2,000 chars opcional), `status` (si no viene, se setea `pending`).
- **Unicidad:** `title` no necesariamente único (permitido repetir en MVP).
- **Orden por defecto en listados:** `created_at DESC`.

---

## 4. Requisitos funcionales (RF) con criterios de aceptación

### RF-1 Crear una tarea
**Historia:** Como usuario, quiero crear tareas con título/descr. y que inicien como `pending` para organizarlas.  
**Criterios de aceptación:**
1. Dado un payload válido, cuando POST `/tasks` entonces responde `201` con el recurso creado y su `id`.
2. Si `status` no se envía, se establece `pending`.
3. Si `title` está vacío o supera 120 caracteres, responde `400` con detalles.
4. Persistencia garantizada: nueva fila en BD con `created_at` y `updated_at`.

### RF-2 Listar tareas
**Historia:** Como usuario, quiero ver una lista de tareas.  
**Criterios de aceptación:**
1. GET `/tasks` devuelve `200` con arreglo de tareas.
2. Soporta `?status=` para filtrar por estado (opcional) y `?q=` para buscar en `title`/`description` (opcional, `LIKE`/`ILIKE`).
3. Orden por defecto: `created_at DESC`. Paginación opcional `?limit=&offset=`.

### RF-3 Actualizar estado de una tarea
**Historia:** Como usuario, quiero cambiar el estado de una tarea a `in_progress` o `done`.  
**Criterios de aceptación:**
1. PUT `/tasks/{id}/status` con `{ status }` válido retorna `200` con la tarea actualizada.
2. Si `id` no existe, retorna `404`.
3. Si la transición no es permitida (ej. `done` → `pending`), retorna `409` con código de error `INVALID_TRANSITION`.
4. `updated_at` se actualiza.

---

## 5. Requisitos no funcionales (RNF)

### RNF‑A Lenguaje y estilo
- **TypeScript** como lenguaje base.
- Principios **SOLID**, especialmente **SRP** en controladores/servicios/repositorios.
- Linter/formatter (ESLint + Prettier) y convenciones de commits (Conventional Commits).

### RNF‑B Asincronía
- Operaciones de acceso a datos y controladores con **async/await** y **Promises**.
- No se bloquea el event loop; uso de conexiones/clients de BD asíncronos.

### RNF‑C API REST
- Semántica HTTP correcta (códigos 2xx/4xx/5xx, verbos, idempotencia donde aplique).
- Contratos definidos por **OpenAPI 3.1** (fuente de verdad para generación de clientes/tests/docs).

### RNF‑D Arquitectura
- Patrón **MVC** con estratos explícitos: **Controller → Service → Repository → DB**.
- Capas desacopladas mediante interfaces; inyección de dependencias a nivel de servicio/repo.

### RNF‑E Datos
- **Opción SQL (MVP)**: **SQLite** para simplicidad local/CI, con migraciones (Knex). Posibilidad de switchear a Postgres.

### RNF‑F Seguridad (placeholders + buenas prácticas)
- Middleware `checkAuth()` (placeholder) y `checkPermissions()` (placeholder) a nivel de rutas.
- Validación de entradas (zod). Sanitización básica.
- CORS restrictivo (origin configurable), rate‑limit básico, headers de seguridad (Helmet).
- Gestión de secretos por variables de entorno; **no** hardcodear secretos.
- Logging de auditoría mínimo (evento de creación/estado cambiado).

### RNF‑G Calidad y pruebas
- **Contract testing** contra OpenAPI, unit tests en servicios, e2e sobre rutas.
- Cobertura mínima 70% líneas en MVP.

### RNF‑H Observabilidad
- Logs estructurados (JSON), correlación de request (request‑id), métricas básicas (req/sec, latencia p95), healthcheck `GET /health`.

### RNF‑I Despliegue/entorno
- Dockerfile y docker‑compose para levantar API + SQLite.
- CI: lint, build, tests, contract tests y publicación de documentación.

---

## 6. Modelo de datos (SQL – SQLite)

**Tabla `tasks`**
- `id` (string, uuid, PK)
- `title` (varchar(120), not null)
- `description` (varchar(2000), null)
- `status` (enum: `pending` | `in_progress` | `done`, default `pending`)
- `created_at` (datetime, default now)
- `updated_at` (datetime, default now, on update now)

**Restricciones:**
- CHECK de longitud en `title` y `description` (lado aplicación).
- Índices: `idx_tasks_status_created_at (status, created_at DESC)` y búsqueda de texto simple para `q`.

---

## 7. Esquemas (JSON Schema / OpenAPI components)

```yaml
components:
  schemas:
    Task:
      type: object
      required: [id, title, status, created_at, updated_at]
      properties:
        id: { type: string, format: uuid }
        title: { type: string, minLength: 1, maxLength: 120 }
        description: { type: string, maxLength: 2000 }
        status:
          type: string
          enum: [pending, in_progress, done]
        created_at: { type: string, format: date-time }
        updated_at: { type: string, format: date-time }
    CreateTaskInput:
      type: object
      required: [title]
      properties:
        title: { type: string, minLength: 1, maxLength: 120 }
        description: { type: string, maxLength: 2000 }
        status: { $ref: '#/components/schemas/Task/properties/status' }
    UpdateTaskStatusInput:
      type: object
      required: [status]
      properties:
        status: { $ref: '#/components/schemas/Task/properties/status' }
    ErrorResponse:
      type: object
      required: [code, message]
      properties:
        code: { type: string }
        message: { type: string }
        details: { type: array, items: { type: string } }
```

---

## 8. Contrato OpenAPI (3.1 – extracto ejecutable)

```yaml
openapi: 3.1.0
info:
  title: DevPro Tasks API (MVP)
  version: 1.0.0
servers:
  - url: http://localhost:3000
paths:
  /health:
    get:
      summary: Healthcheck
      responses:
        '200': { description: OK }
  /tasks:
    post:
      summary: Crear tarea
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/CreateTaskInput' }
      responses:
        '201':
          description: Creada
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Task' }
        '400': { description: Payload inválido, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
    get:
      summary: Listar tareas
      parameters:
        - in: query
          name: status
          schema: { type: string, enum: [pending, in_progress, done] }
        - in: query
          name: q
          schema: { type: string }
        - in: query
          name: limit
          schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
        - in: query
          name: offset
          schema: { type: integer, minimum: 0, default: 0 }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items: { $ref: '#/components/schemas/Task' }
                  total: { type: integer }
        '400': { description: Parámetros inválidos, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
  /tasks/{id}/status:
    put:
      summary: Actualizar estado de una tarea
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string, format: uuid }
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/UpdateTaskStatusInput' }
      responses:
        '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/Task' } } } }
        '400': { description: Payload inválido, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        '404': { description: No encontrado }
        '409': { description: Transición inválida, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
components:
  schemas:
    # (referenciadas en §7)
```

---

## 9. Arquitectura y capas (MVC + SRP)
**Rutas/Controllers** (orquestación HTTP) → **Services** (reglas de negocio: validación de estado, transiciones, búsqueda) → **Repositories** (persistencia) → **DB** (SQLite).  
**Inyección de dependencias:** Services dependen de interfaces `TaskRepository` para facilitar testeo/mocks.

**Estructura sugerida:**
```
src/
  app.ts (bootstrap, middlewares, routes)
  routes/
    tasks.routes.ts
  controllers/
    tasks.controller.ts
  services/
    tasks.service.ts
  repositories/
    tasks.repo.ts (implements TaskRepository)
    types.ts (interfaces)
  domain/
    Task.ts (modelo + validaciones)
  infra/
    db.ts (knex client, migrations)
  middlewares/
    auth.ts (placeholder), validate.ts, error.ts
  observability/
    logger.ts, metrics.ts, request-id.ts
  tests/
    unit/, contract/, e2e/
openapi/
  devpro-tasks.yaml
```

---

## 10. Seguridad (detalles de placeholder y prácticas)
- **AuthN/AuthZ:**
  - Placeholder `checkAuth()` agrega `req.user = { id: 'demo' }`.
  - `checkPermissions()` (futuro) para scope `tasks:write` y `tasks:read`.
- **Entrada:** Validación de `CreateTaskInput` y `UpdateTaskStatusInput`; rechazar payloads extra (strict mode).
- **Headers y CORS:** Helmet, CORS con allowlist por entorno.
- **Rate‑limit:** 100 req/5 min por IP (MVP, configurable).
- **Logs de seguridad:** creación y cambios de estado con `userId` (placeholder).

---

## 11. Pruebas y calidad
- **Unitarias (Vitest):** servicios y validadores de transiciones.
- **Contract tests:** validar respuestas contra OpenAPI (ej. `dredd` o `schemathesis`).
- **E2E (Supertest):** rutas `/tasks`, `/tasks/{id}/status` y errores.
- **Criterio de aceptación automático:** suite verde + cobertura ≥ 70%.

---

## 12. Observabilidad y operativa
- **Logs** JSON con `request_id`, niveles (`info|warn|error`).
- **Metrics** (middleware) – throughput, latencia p95, 4xx/5xx.
- **Healthcheck** `GET /health`.

---

## 13. Pipeline CI/CD (resumen)
1) Lint + TypeCheck.  
2) Build.  
3) Unit + Contract + E2E.  
4) Lint de OpenAPI + breaking‑change check (ej. `openapi-diff`).  
5) Publicación de docs (Swagger UI) y paquete Docker.  

---

## 14. Decisiones de arquitectura (ADRs)
- **ADR‑001:** SQLite en MVP por simplicidad; objetivo migrar a Postgres en Fase 2.
- **ADR‑002:** OpenAPI es fuente de verdad; cambios de API solo vía PR sobre spec.
- **ADR‑003:** SRP reforzado mediante repositorios/servicios e interfaces.

---

## 15. Métricas de éxito (MVP)
- Tiempo medio de creación a finalización (`pending→done`).
- Adopción interna (nº de tareas/usuario) durante piloto.
- % de PRs con cambios consistentes de spec+código+tests.

---

## 16. Riesgos y mitigaciones
- **Spec incompleta:** revisión cruzada + examples en OpenAPI.
- **Deriva de contrato:** contract tests en CI + diff OpenAPI.
- **Seguridad insuficiente (MVP):** placeholders hoy; plan de Auth real en Fase 2 (OAuth2/JWT).

---

## 17. Glosario
- **SDD:** Spec‑Driven Development.  
- **SRP:** Single Responsibility Principle.  
- **Contract test:** Prueba que valida que las respuestas cumplen el contrato formal.

---

## 18. Apéndice – Prompts/guías para IA (uso operativo)
- *"A partir de `openapi/devpro-tasks.yaml`, genera controladores en TS con Express usando async/await y servicios desacoplados. No escribas lógica de BD en controladores. Añade validación con zod."*
- *"Genera pruebas de contrato contra el OpenAPI y e2e con Supertest para los 3 endpoints definidos."*
- *"Propón refactorizaciones en Services para reforzar SRP y añade logs estructurados."*

---

## 19. Proceso SDD+IA (pasos, roles, artefactos)
**Objetivo:** Operativizar el enfoque Spec‑Driven Development con apoyo de IA, asegurando trazabilidad desde la spec hasta el código y las pruebas.

### 19.1 Pasos
1) **Descubrimiento & Alcance** → Definir problemas, objetivos y métricas.
2) **Especificación (Spec‑First)** → Redactar/actualizar OpenAPI + Schemas + reglas de negocio + criterios de aceptación.
3) **Gobernanza & Arquitectura** → ADRs, linters de spec, control de cambios incompatibles.
4) **Generación asistida por IA** → Scaffolding (controllers/DTOs/validaciones/tests) desde la spec.
5) **Implementación** → Lógica de negocio en Services; persistencia en Repository; asincronía con async/await.
6) **Pruebas automáticas** → Unitarias, contract tests (contra OpenAPI), E2E.
7) **Documentación viva** → Swagger UI/SDKs generados desde la spec en CI.
8) **Release & Observabilidad** → Healthcheck, logs estructurados, métricas p95, rate limit básico.
9) **Evolución de la spec** → PRs a la spec, validaciones de ruptura y regeneración asistida por IA.

### 19.2 Roles
- **Product Owner / Stakeholders:** definen valor y escenarios; validan criterios de aceptación.
- **Arquitecto/Tech Lead:** custodia de la spec y la arquitectura; define governance.
- **Desarrolladores (con IA):** generan/ajustan código alineado a la spec; proponen refactors SOLID.
- **QA:** deriva pruebas de la spec; mantiene contract/E2E.
- **DevOps/Plataforma:** integra linters, tests y publicación de docs en CI/CD.

### 19.3 Artefactos
- **Esenciales:** `openapi/devpro-tasks.yaml`, JSON Schemas, ADRs, scripts de migración SQL, linters y contract tests.
- **Derivados:** Swagger UI, SDKs, reportes de cobertura, imágenes Docker, dashboard de métricas.

### 19.4 Criterios de “Definition of Done” (MVP)
- Spec actualizada y versionada; sin rupturas (diff OK).
- Suite verde (unitarias ≥70%, contract, E2E) y build passing en CI.
- Docs publicadas desde la spec; imagen Docker generada.
- Seguridad básica activa (Helmet, CORS, rate limit, validación de entrada).
- Observabilidad mínima operativa (logs JSON + healthcheck + métricas).
