import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SuccessResponse } from '@base/response';
import { UserEntity, UserStatus } from '@domain/models';
import { UserRequestBody } from '@data/entities/user-request.entity';
import { USERS_MOCK } from './users.mock';

/**
 * Simulación de un backend remoto (NO es una base de datos del front-end).
 *
 * Este módulo imita el servidor: mantiene el estado "del lado del servidor" y
 * expone funciones que devuelven `Observable<SuccessResponse<Entity>>` con un
 * `delay`, tal como respondería una API HTTP real. La capa de datos
 * (repositorio) lo consume igual que consumiría `HttpClient`.
 *
 * Es intencional que el estado viva aquí (en la frontera "servidor") y no en un
 * servicio Angular: el front no debe tener su propia base de datos; solo pide
 * datos al servidor y renderiza la respuesta.
 */

/** Latencia simulada de red (ms). */
const NETWORK_DELAY_MS = 700;

/** Estado del servidor simulado (copia mutable de la semilla del mock). */
let serverUsers: UserEntity[] = USERS_MOCK.map((u) => ({ ...u }));

/** Secuencia de ids, como el autoincremental de la tabla en el servidor. */
let sequence = serverUsers.reduce((max, u) => Math.max(max, u.id), 0);

/** Empaqueta un dato en el sobre de respuesta y simula la latencia de red. */
function respond<T>(data: T): Observable<SuccessResponse<T>> {
  const body: SuccessResponse<T> = { code: 'OK', message: 'success', data };
  return of(body).pipe(delay(NETWORK_DELAY_MS));
}

/** GET /users (con filtros opcionales que aplica el "servidor"). */
export function fetchUsers(query: UserRequestBody): Observable<SuccessResponse<UserEntity[]>> {
  let result = serverUsers.map((u) => ({ ...u }));

  if (query.search) {
    const term = query.search.toLowerCase();
    result = result.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }
  if (query.status) {
    result = result.filter((u) => u.status === query.status);
  }
  if (query.dependencyId !== undefined) {
    result = result.filter((u) => u.dependencyId === query.dependencyId);
  }

  return respond(result);
}

/** GET /users/:id */
export function fetchUserById(id: number): Observable<SuccessResponse<UserEntity | null>> {
  const found = serverUsers.find((u) => u.id === id) ?? null;
  return respond(found ? { ...found } : null);
}

/** POST /users */
export function createUser(body: UserRequestBody): Observable<SuccessResponse<UserEntity>> {
  const created: UserEntity = {
    id: ++sequence,
    firstName: body.firstName ?? '',
    lastName: body.lastName ?? '',
    phone: body.phone ?? '',
    email: body.email ?? '',
    dependencyId: body.dependencyId ?? 0,
    // El servidor respeta el estado que envía el cliente; por regla de negocio
    // el cliente (vía Builder) siempre manda "Activo" al crear.
    status: body.status ?? UserStatus.Active,
  };
  serverUsers = [...serverUsers, created];
  return respond({ ...created });
}

/** PUT /users/:id */
export function updateUser(id: number, body: UserRequestBody): Observable<SuccessResponse<UserEntity>> {
  const index = serverUsers.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new Error(`Usuario ${id} no encontrado`);
  }
  const current = serverUsers[index];
  const updated: UserEntity = {
    ...current,
    firstName: body.firstName ?? current.firstName,
    lastName: body.lastName ?? current.lastName,
    phone: body.phone ?? current.phone,
    email: body.email ?? current.email,
    dependencyId: body.dependencyId ?? current.dependencyId,
    // status solo cambia si el body lo trae (endpoint de estado); la edición
    // normal no lo envía y por tanto se conserva.
    status: body.status ?? current.status,
  };
  serverUsers = serverUsers.map((u) => (u.id === id ? updated : u));
  return respond({ ...updated });
}
