# Gestión de tareas - Monorepo TypeScript

Este proyecto contiene una API Express y una aplicación React para gestionar tareas. El repositorio está organizado como un monorepo con *npm workspaces* (`backend` y `frontend`).

## Requisitos previos

- Node.js 18 o superior (recomendado Node.js 20).
- npm 9 o superior (se instala junto con Node.js).

## Instalación de dependencias

1. Instala todas las dependencias desde la raíz del repositorio:

   ```bash
   npm install
   ```

   El comando anterior instala las dependencias de ambos workspaces. Si necesitas reinstalar desde cero, elimina las carpetas `node_modules` y el archivo `package-lock.json` de la raíz y de cada paquete antes de volver a ejecutar `npm install`.

2. (Opcional) Comprueba los scripts disponibles:

   ```bash
   npm run
   ```

## Variables de entorno

El backend admite variables definidas en un archivo `.env` ubicado en la carpeta `backend`. Si el archivo existe, sus valores se cargan automáticamente en tiempo de ejecución. Un ejemplo básico es el siguiente:

```env
# backend/.env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=file:./dev.db
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=300000
```

Puedes ajustar los valores según tus necesidades. Las variables ya presentes en `process.env` no se sobrescribirán.

## Ejecución en desarrollo

Desde la raíz del repositorio puedes iniciar cada aplicación utilizando los scripts del workspace correspondiente:

- API (Express):

  ```bash
  npm run dev --workspace backend
  ```

  El servidor escucha por defecto en `http://localhost:3000`.

- Frontend (Vite + React):

  ```bash
  npm run dev --workspace frontend
  ```

  Vite levanta la aplicación en `http://localhost:5173`.

Para ejecutar ambos servicios simultáneamente, abre dos terminales y lanza cada comando por separado.

## Construcción y pruebas

- Compilar cada paquete:

  ```bash
  npm run build --workspace backend
  npm run build --workspace frontend
  ```

- Ejecutar las suites de pruebas (si están disponibles):

  ```bash
  npm test --workspace backend
  npm test --workspace frontend
  ```

> **Nota:** A día de hoy la compilación de los paquetes backend y frontend falla debido a problemas de tipado que ya estaban presentes en la base de código. Revisa los errores que muestra TypeScript y corrígelos antes de generar un build para producción.

## Sobre el error `npm install` con `dotenv`

En este entorno la petición directa al registro de npm para el paquete `dotenv` devuelve un error `403 Forbidden`, lo que provoca fallos al instalar dependencias si se intenta descargar dicho paquete explícitamente:

```
npm ERR! 403 403 Forbidden - GET https://registry.npmjs.org/dotenv
```

Para evitar el bloqueo se eliminó la dependencia de `dotenv` en el backend y se incorporó un cargador ligero de variables de entorno implementado con las APIs nativas de Node.js. De este modo la instalación de dependencias vuelve a funcionar sin necesidad de acceder al paquete afectado.
