import { User } from '@domain/models';

/**
 * ============================================================================
 * PATRÓN (tabla de despacho / dispatch table) — variante funcional de Strategy
 * ============================================================================
 *
 * QUÉ ES:
 *   Una tabla que asocia una clave (el id de la columna) con la función que
 *   sabe extraer/formatear el valor de esa columna. Reemplaza un `switch`
 *   gigante por un lookup en un objeto.
 *
 * CÓMO SE USA AQUÍ:
 *   La tabla de usuarios tiene columnas (nombre completo, teléfono, correo,
 *   dependencia...). En lugar de que la plantilla acceda campo por campo o de
 *   tener un `switch (columna)`, cada columna declara su `field` y su `render`,
 *   y `COLUMN_RENDERERS` resuelve el texto de la celda. Agregar una columna es
 *   agregar una entrada al arreglo/tabla, sin tocar la plantilla ni la lógica
 *   existente (OCP).
 *
 * POR QUÉ:
 *   Es la misma idea que el `RENDERERS` de PIC_Portal_transaction_MF: config
 *   dirigida por datos, extensible y libre de condicionales dispersos.
 *
 * ----------------------------------------------------------------------------
 * ANTES (SIN el patrón) — la plantilla o un switch conocían cada columna:
 * ----------------------------------------------------------------------------
 * //   getCell(user, columnId) {
 * //     switch (columnId) {
 * //       case 'fullName': return user.firstName + ' ' + user.lastName;
 * //       case 'phone':    return user.phone;
 * //       case 'email':    return user.email;
 * //       case 'dependency': return user.dependency.name;
 * //       // agregar una columna => modificar este switch (viola OCP)
 * //     }
 * //   }
 * ----------------------------------------------------------------------------
 */

/** Descriptor de una columna de la tabla. */
export interface UserColumn {
  header: string;
  id: string;
}

/** Columnas de texto de la tabla (las acciones y el estado se pintan aparte). */
export const USER_TEXT_COLUMNS: readonly UserColumn[] = [
  { header: 'Nombre completo', id: 'fullName' },
  { header: 'Teléfono', id: 'phone' },
  { header: 'Correo', id: 'email' },
  { header: 'Dependencia', id: 'dependency' },
];

/** Tabla de despacho: id de columna -> función que devuelve el texto a mostrar. */
export const COLUMN_RENDERERS: Readonly<Record<string, (user: User) => string>> = {
  fullName: (user) => user.fullName,
  phone: (user) => user.phone,
  email: (user) => user.email,
  dependency: (user) => user.dependency.name,
};

/** Resuelve el texto de una celda usando la tabla de despacho. */
export function renderCell(user: User, columnId: string): string {
  const renderer = COLUMN_RENDERERS[columnId];
  return renderer ? renderer(user) : '';
}
