/**
 * ============================================================================
 * PATRÓN ESTRUCTURAL: Adapter (clase base de los Mappers)
 * ============================================================================
 *
 * QUÉ ES:
 *   Adapter convierte la interfaz de un objeto en otra que el cliente espera,
 *   para que dos representaciones incompatibles trabajen juntas.
 *
 * CÓMO SE USA AQUÍ:
 *   `Mapper<I, O>` es el contrato base para traducir entre la forma que
 *   entrega el backend (Entity, `I`) y la forma que consume el dominio/UI
 *   (Model, `O`). `mapFrom` es obligatorio (Entity -> Model). `mapTo` es
 *   opcional (Model -> Entity) para los casos que necesiten el camino inverso.
 *
 * POR QUÉ:
 *   Concentra la traducción en clases dedicadas y reutilizables, evitando que
 *   cada componente arme el modelo "a mano" (DRY) y aislando a la UI del shape
 *   real del backend.
 */
export abstract class Mapper<I, O> {
  protected abstract mapFrom(param: I): O;
  protected mapTo?(param: O): I;
}
