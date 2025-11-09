import { App } from './components/app';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('Contenedor principal no encontrado');
  }
  // eslint-disable-next-line no-new
  new App(container);
});
