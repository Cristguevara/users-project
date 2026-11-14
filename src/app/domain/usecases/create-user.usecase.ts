import { Observable } from 'rxjs';
import { UseCase } from '@base/use-case';
import { User, UserFormData } from '@domain/models';
import { UserRepository } from '@domain/repositories';

/**
 * PATRÓN Command (Caso de uso): crear un usuario nuevo.
 * La regla "nace Activo" la aplica el Builder dentro del repositorio; este caso
 * de uso solo expone la acción de negocio de forma uniforme.
 */
export class CreateUserUseCase implements UseCase<UserFormData, User> {
  constructor(private readonly userRepository: UserRepository) {}

  execute(data: UserFormData): Observable<User> {
    return this.userRepository.create(data);
  }
}
