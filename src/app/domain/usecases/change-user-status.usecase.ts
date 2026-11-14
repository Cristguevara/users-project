import { Observable } from 'rxjs';
import { UseCase } from '@base/use-case';
import { User, UserStatus } from '@domain/models';
import { UserRepository } from '@domain/repositories';

/** Parámetros: id del usuario + estado destino. */
export interface ChangeUserStatusParams {
  id: number;
  status: UserStatus;
}

/**
 * PATRÓN Command (Caso de uso): activar o inactivar un usuario.
 * La vista calcula el estado destino y llama a este caso de uso; tras responder
 * el servidor, la vista re-consulta el listado.
 */
export class ChangeUserStatusUseCase implements UseCase<ChangeUserStatusParams, User> {
  constructor(private readonly userRepository: UserRepository) {}

  execute({ id, status }: ChangeUserStatusParams): Observable<User> {
    return this.userRepository.changeStatus(id, status);
  }
}
