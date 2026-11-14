import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Dependency } from '@domain/models';
import { DependencyRepository } from '@domain/repositories';
import { fetchDependencies } from '@data/mocks/dependency-backend.mock';

/**
 * Lado IMPLEMENTACIÓN del patrón Bridge para DependencyRepository.
 *
 * Consume el backend simulado (`fetchDependencies`), que responde un
 * SuccessResponse tras un delay, y extrae `res.data` como haría una
 * implementación real con `HttpClient`.
 */
@Injectable()
export class DependencyHttpRepository extends DependencyRepository {
  override getAll(): Observable<Dependency[]> {
    return fetchDependencies().pipe(map((res) => res.data));
  }
}
