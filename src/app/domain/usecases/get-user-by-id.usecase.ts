import { Observable } from 'rxjs';
import { UseCase } from '@base/use-case';
import { User } from '@domain/models';
import { UserRepository } from '@domain/repositories';

/**
 * PATRÓN Command (Caso de uso): obtener un usuario por su id.
 * Se usa al entrar al formulario en modo edición (carga por :id del path).
 */
export class GetUserByIdUseCase implements UseCase<number, User | undefined> {
  constructor(private readonly userRepository: UserRepository) {}

  execute(id: number): Observable<User | undefined> {
    return this.userRepository.getById(id);
  }
}
