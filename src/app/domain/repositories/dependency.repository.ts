import { Observable } from 'rxjs';
import { Dependency } from '@domain/models';

/**
 * PATRÓN ESTRUCTURAL: Bridge (abstracción del origen de datos de dependencias).
 *
 * Igual que UserRepository, es el lado ABSTRACCIÓN del puente: define QUÉ
 * operación existe (traer las dependencias que alimentan el <select>) sin
 * decir CÓMO se obtienen. El lado IMPLEMENTACIÓN (DependencyHttpRepository)
 * vive en la capa de datos y se enchufa por DI.
 */
export abstract class DependencyRepository {
  /** Trae todas las dependencias disponibles (simula GET /dependencies). */
  abstract getAll(): Observable<Dependency[]>;
}
