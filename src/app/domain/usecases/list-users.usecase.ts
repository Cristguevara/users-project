import { Observable } from 'rxjs';
import { UseCase } from '@base/use-case';
import { User, UserFilter } from '@domain/models';
import { UserRepository } from '@domain/repositories';

/**
 * PATRÓN Command (Caso de uso): consultar usuarios, opcionalmente filtrados.
 *
 * Recibe los criterios de filtro (`UserFilter`) y devuelve la lista de usuarios.
 * Depende del repositorio ABSTRACTO (DIP): no sabe si detrás hay HTTP o un mock.
 * La vista solo hace `listUsers.execute(filtro)`.
 */
export class ListUsersUseCase implements UseCase<UserFilter, User[]> {
  constructor(private readonly userRepository: UserRepository) {}

  execute(filter: UserFilter): Observable<User[]> {
    return this.userRepository.list(filter);
  }
}
