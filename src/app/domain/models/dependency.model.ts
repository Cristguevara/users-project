/**
 * Dependencia (área/departamento) tal como vendría en una tabla de base de datos.
 * Ejemplo de fila: { id: 1, name: 'Dependencia 1' }
 */
export interface Dependency {
  readonly id: number;
  readonly name: string;
}
