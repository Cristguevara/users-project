/**
 * PATRÓN ESTRUCTURAL: Adapter (variante unidireccional).
 *
 * `MapperTo<I, O>` traduce en un solo sentido con un método público `execute`.
 * Se usa típicamente para construir el "request body" que espera el backend a
 * partir de un modelo de dominio (dominio -> entidad de red).
 */
export abstract class MapperTo<I, O> {
  public abstract execute(dto: I): O;
}
