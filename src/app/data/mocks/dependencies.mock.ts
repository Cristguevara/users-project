import { Dependency } from '@domain/models';

/**
 * Mock de dependencias, simulando cómo estarían en una tabla de base de datos:
 * cada fila es { id, name }.
 *
 * Estas son las 3 dependencias que alimentan el <select> del formulario y a las
 * que hacen referencia los usuarios del mock (ver users.mock.ts) por su `id`.
 */
export const DEPENDENCIES_MOCK: Dependency[] = [
  { id: 1, name: 'Dependencia 1' },
  { id: 2, name: 'Dependencia 2' },
  { id: 3, name: 'Dependencia 3' },
];
