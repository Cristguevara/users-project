import { UserStatus } from './user-status.enum';

/**
 * Filtros de dominio para consultar el listado de usuarios.
 * La vista construye estos criterios; el Builder los traduce al request body
 * que el backend espera.
 */
export interface UserFilter {
  /** Búsqueda libre por nombre completo o correo. */
  search?: string;
  /** Filtrar por estado. */
  status?: UserStatus;
  /** Filtrar por dependencia. */
  dependencyId?: number;
}
