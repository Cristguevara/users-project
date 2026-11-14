import { Observable } from 'rxjs';
import { UseCase } from '@base/use-case';
import { Dependency } from '@domain/models';
import { DependencyRepository } from '@domain/repositories';

/**
 * PATRÓN Command (Caso de uso): obtener el catálogo de dependencias para el
 * <select> del formulario. No recibe parámetros (`void`).
 */
export class GetDependenciesUseCase implements UseCase<void, Dependency[]> {
  constructor(private readonly dependencyRepository: DependencyRepository) {}

  execute(): Observable<Dependency[]> {
    return this.dependencyRepository.getAll();
  }
}
