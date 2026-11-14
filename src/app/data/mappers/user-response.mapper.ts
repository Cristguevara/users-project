import { Mapper } from '@base/mapper';
import { Dependency, User, UserEntity } from '@domain/models';

/**
 * ============================================================================
 * PATRÓN ESTRUCTURAL: Adapter (Mapper concreto Entity -> Model)
 * ============================================================================
 *
 * QUÉ ES:
 *   Adapter convierte una representación en otra que el cliente espera. Aquí
 *   traduce la ENTIDAD que devuelve el backend (`UserEntity`: campos separados
 *   y `dependencyId`) al MODELO que la UI consume (`User`: con `fullName` ya
 *   calculado y el objeto `dependency` completo).
 *
 * CÓMO SE USA AQUÍ:
 *   Extiende la clase base `Mapper<I, O>` e implementa `mapFrom`. Como necesita
 *   el catálogo de dependencias para resolver la clave foránea, la entrada `I`
 *   es un par `{ entity, dependencies }`. El repositorio concreto lo invoca
 *   dentro de `.pipe(map(res => this.mapper.mapFrom(...)))`, exactamente como se
 *   mapea la respuesta de una llamada HTTP real.
 *
 * POR QUÉ ESTE PATRÓN Y NO OTRO:
 *   La forma del backend y la forma que la vista consume son legítimamente
 *   distintas. Sin un Mapper, cada componente armaría el `fullName` y buscaría
 *   la dependencia por su cuenta (se repetiría la lógica y el shape del backend
 *   se filtraría a la UI, violando DRY). Se eligió Adapter/Mapper y no meter
 *   `fullName` en la entidad para mantener la entidad fiel a la respuesta del
 *   servidor y centralizar la traducción en un punto reutilizable y testeable.
 *   Es extensible: si el modelo de UI necesita un campo derivado más, se agrega
 *   aquí sin tocar la entidad ni las vistas.
 *
 * ----------------------------------------------------------------------------
 * CÓMO SE VEÍA ANTES (SIN PATRÓN) — código problemático:
 * ----------------------------------------------------------------------------
 * // // La conversión se hacía "a mano" y repetida en cada plantilla:
 * //
 * //   // en el .html de la tabla:
 * //   {{ user.firstName }} {{ user.lastName }}
 * //   // y para la dependencia, buscarla en cada vista:
 * //   {{ dependencies.find(d => d.id === user.dependencyId)?.name }}
 * //
 * // Problemas concretos:
 * //   1. "nombre completo = firstName + lastName" repetido en N vistas (DRY).
 * //   2. Cada vista tiene que conocer `dependencyId` y cómo resolverlo =>
 * //      el shape del backend se filtra a la capa de presentación.
 * //   3. Si cambia cómo se arma el nombre, hay que tocar todos esos archivos.
 * ----------------------------------------------------------------------------
 */

/** Entrada del mapper: la entidad del backend + el catálogo de dependencias. */
export interface UserEntityWithCatalog {
  entity: UserEntity;
  dependencies: Dependency[];
}

export class UserResponseMapper extends Mapper<UserEntityWithCatalog, User> {
  public mapFrom({ entity, dependencies }: UserEntityWithCatalog): User {
    const dependency =
      dependencies.find((d) => d.id === entity.dependencyId) ??
      // Fallback defensivo si la FK no existiera en el catálogo:
      { id: entity.dependencyId, name: 'Sin dependencia' };

    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      fullName: `${entity.firstName} ${entity.lastName}`.trim(),
      phone: entity.phone,
      email: entity.email,
      dependency,
      status: entity.status,
    };
  }

  /** Adapta una LISTA de entidades reutilizando `mapFrom`. */
  public mapList(entities: UserEntity[], dependencies: Dependency[]): User[] {
    return entities.map((entity) => this.mapFrom({ entity, dependencies }));
  }
}
