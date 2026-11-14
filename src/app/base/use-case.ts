import { Observable } from 'rxjs';

/**
 * ============================================================================
 * PATRÓN DE COMPORTAMIENTO: Command (aquí materializado como "Caso de uso")
 * ============================================================================
 *
 * QUÉ ES:
 *   Command encapsula una petición/acción como un objeto con una interfaz
 *   uniforme (`execute`). El invocador dispara la acción sin conocer los
 *   detalles de cómo se resuelve.
 *
 * CÓMO SE USA AQUÍ:
 *   Cada operación de negocio (listar usuarios, crearlo, editarlo, cambiar su
 *   estado, buscarlo) es un objeto "caso de uso" que implementa esta interfaz
 *   `UseCase<S, T>`: recibe `S` (parámetros de entrada) y devuelve un
 *   `Observable<T>`. La vista solo llama `useCase.execute(params)`.
 *
 * POR QUÉ ESTE PATRÓN Y NO OTRO / NI NADA:
 *   Sin esta interfaz común, la lógica de negocio viviría dentro de los
 *   componentes o mezclada con el acceso a datos. Al encapsular cada acción en
 *   su propio objeto con `execute`, la presentación queda desacoplada de la
 *   política de negocio (SRP), y agregar una acción nueva es crear una clase
 *   nueva sin tocar las existentes (OCP). Es extensible: cada caso de uso se
 *   puede componer, testear y proveer de forma independiente.
 */
export interface UseCase<S, T> {
  execute(params: S): Observable<T>;
}
