import { UserStatus } from '@domain/models';

/**
 * Forma del "request body" que el backend simulado espera para crear/editar/
 * consultar usuarios. Todos los campos son opcionales porque distintas
 * operaciones envían distintos subconjuntos:
 *   - crear:  firstName, lastName, phone, email, dependencyId, status
 *   - editar: igual, pero sin status
 *   - cambiar estado: solo status (+ id en la ruta)
 *   - filtrar/buscar: search, status, dependencyId
 *
 * Este objeto NO se construye a mano en la vista: lo arma el Builder
 * (ver src/app/patterns/builder/user-request.builder.ts), que decide qué
 * campos incluir según la operación.
 */
export interface UserRequestBody {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  dependencyId?: number;
  status?: UserStatus;

  // filtros de búsqueda (GET /users)
  search?: string;
}
