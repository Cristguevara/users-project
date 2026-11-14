import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SuccessResponse } from '@base/response';
import { Dependency } from '@domain/models';
import { DEPENDENCIES_MOCK } from './dependencies.mock';

/** Latencia simulada de red (ms). */
const NETWORK_DELAY_MS = 400;

/**
 * Simula GET /dependencies: el "servidor" responde el catálogo de dependencias
 * envuelto en un SuccessResponse tras un pequeño retardo de red.
 */
export function fetchDependencies(): Observable<SuccessResponse<Dependency[]>> {
  const data = DEPENDENCIES_MOCK.map((d) => ({ ...d }));
  return of<SuccessResponse<Dependency[]>>({ code: 'OK', message: 'success', data }).pipe(
    delay(NETWORK_DELAY_MS)
  );
}
