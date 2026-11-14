import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User, UserFilter, UserFormData, UserStatus } from '@domain/models';
import { UserRepository } from '@domain/repositories';
import { UserResponseMapper } from '@data/mappers/user-response.mapper';
import { UserRequestBuilder } from '@patterns/builder/user-request.builder';
import { DEPENDENCIES_MOCK } from '@data/mocks/dependencies.mock';
import {
  createUser,
  fetchUserById,
  fetchUsers,
  updateUser,
} from '@data/mocks/user-backend.mock';

/**
 * Lado IMPLEMENTACIÓN del patrón Bridge (ver domain/repositories/user.repository.ts).
 *
 * `UserRepository` es la abstracción; esta clase es una implementación concreta
 * de esa abstracción: el origen de datos "HTTP". Cumple las operaciones armando
 * el request, "llamando al servidor" y mapeando la respuesta. Hoy el servidor es
 * un mock (src/app/data/mocks/user-backend.mock.ts) que responde un
 * SuccessResponse tras un delay; mañana bastaría cambiar esas llamadas por
 * `this.http.get/post(...)`, o añadir una implementación hermana (GraphQL,
 * IndexedDB) sin tocar la abstracción ni sus consumidores.
 *
 * Aquí CONVERGEN varios patrones:
 *  - Bridge   -> es la implementación que la abstracción UserRepository enchufa.
 *  - Builder  -> UserRequestBuilder arma el request body según la operación.
 *  - Adapter  -> UserResponseMapper traduce Entity (respuesta) -> User (UI).
 */
@Injectable()
export class UserHttpRepository extends UserRepository {
  private readonly mapper = new UserResponseMapper();

  override list(filter: UserFilter): Observable<User[]> {
    // BUILDER: construye el query body solo con los filtros presentes.
    const query = new UserRequestBuilder()
      .withSearch(filter.search ?? '')
      .build();
    if (filter.status) query.status = filter.status;
    if (filter.dependencyId !== undefined) query.dependencyId = filter.dependencyId;

    return fetchUsers(query).pipe(
      // ADAPTER: respuesta del backend (Entity[]) -> modelos de UI (User[]).
      map((res) => this.mapper.mapList(res.data, DEPENDENCIES_MOCK))
    );
  }

  override getById(id: number): Observable<User | undefined> {
    return fetchUserById(id).pipe(
      map((res) =>
        res.data
          ? this.mapper.mapFrom({ entity: res.data, dependencies: DEPENDENCIES_MOCK })
          : undefined
      )
    );
  }

  override create(data: UserFormData): Observable<User> {
    // BUILDER: request de creación con la regla "usuario nuevo nace Activo".
    const body = new UserRequestBuilder().withPersonalData(data).asNewUser().build();

    return createUser(body).pipe(
      map((res) => this.mapper.mapFrom({ entity: res.data, dependencies: DEPENDENCIES_MOCK }))
    );
  }

  override update(id: number, data: UserFormData): Observable<User> {
    // BUILDER: request de edición SIN status (se conserva en el servidor).
    const body = new UserRequestBuilder().withPersonalData(data).build();

    return updateUser(id, body).pipe(
      map((res) => this.mapper.mapFrom({ entity: res.data, dependencies: DEPENDENCIES_MOCK }))
    );
  }

  override changeStatus(id: number, status: UserStatus): Observable<User> {
    // BUILDER: request que solo lleva el estado nuevo.
    const body = new UserRequestBuilder().withStatus(status).build();

    return updateUser(id, body).pipe(
      map((res) => this.mapper.mapFrom({ entity: res.data, dependencies: DEPENDENCIES_MOCK }))
    );
  }
}
