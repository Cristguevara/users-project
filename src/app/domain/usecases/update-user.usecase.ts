import { Observable } from 'rxjs';
import { UseCase } from '@base/use-case';
import { User, UserFormData } from '@domain/models';
import { UserRepository } from '@domain/repositories';

/** Parámetros del caso de uso de edición: id + datos del formulario. */
export interface UpdateUserParams {
  id: number;
  data: UserFormData;
}

/**
 * PATRÓN Command (Caso de uso): editar un usuario existente.
 * No toca el estado (el Builder de edición no envía `status`).
 */
export class UpdateUserUseCase implements UseCase<UpdateUserParams, User> {
  constructor(private readonly userRepository: UserRepository) {}

  execute({ id, data }: UpdateUserParams): Observable<User> {
    return this.userRepository.update(id, data);
  }
}
