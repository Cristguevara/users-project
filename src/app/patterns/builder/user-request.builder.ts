import { UserFormData, UserStatus } from '@domain/models';
import { UserRequestBody } from '@data/entities/user-request.entity';

/**
 * ============================================================================
 * PATRÓN CREACIONAL: Builder
 * ============================================================================
 *
 * QUÉ ES:
 *   Builder separa la CONSTRUCCIÓN de un objeto complejo de su representación,
 *   permitiendo armar el mismo tipo de objeto paso a paso y con variantes
 *   distintas usando el mismo proceso.
 *
 * CÓMO SE USA AQUÍ:
 *   El `UserRequestBody` que espera el backend cambia según la operación:
 *     - crear:        datos personales + status = Activo (regla de negocio)
 *     - editar:       datos personales, SIN status (se conserva en el servidor)
 *     - cambiar estado: SOLO el status
 *     - buscar/filtrar: search / status / dependencyId
 *   `UserRequestBuilder` ofrece métodos encadenables (`withPersonalData`,
 *   `asNewUser`, `withStatus`, `withSearch`...) que van agregando solo los
 *   campos pertinentes y termina en `build()`. La regla "usuario nuevo nace
 *   Activo" queda encapsulada en `asNewUser()`.
 *
 * POR QUÉ ESTE PATRÓN Y NO OTRO:
 *   Las alternativas eran (a) construir el body inline en cada caso de uso con
 *   objetos distintos, repitiendo la forma; o (b) una Factory con un método por
 *   variante. El body tiene MUCHAS combinaciones opcionales de campos, y cada
 *   operación arma un subconjunto: ese es justo el escenario para Builder, que
 *   permite componer el objeto paso a paso y agregar una variante nueva (p.ej.
 *   un filtro por rango de fechas) añadiendo un método SIN tocar los existentes
 *   (OCP). Además evita objetos "medio llenos" con campos en undefined regados
 *   por el código y centraliza la regla de negocio del estado.
 *
 * ----------------------------------------------------------------------------
 * CÓMO SE VEÍA ANTES (SIN PATRÓN) — código problemático:
 * ----------------------------------------------------------------------------
 * // // Cada operación armaba el body a mano, repitiendo la forma y la regla:
 * //
 * //   // crear (en el componente o el servicio):
 * //   const body = {
 * //     firstName: form.firstName, lastName: form.lastName,
 * //     phone: form.phone, email: form.email,
 * //     dependencyId: form.dependencyId,
 * //     status: 'Activo',            // <- regla suelta y repetida
 * //   };
 * //
 * //   // editar: casi igual pero hay que ACORDARSE de NO mandar status...
 * //   const body2 = { firstName: ..., lastName: ... };  // sin status
 * //
 * //   // filtrar: otro objeto distinto con search/status...
 * //
 * // Problemas concretos:
 * //   1. La forma del body y la regla "Activo" se repiten y se pueden
 * //      desincronizar entre operaciones.
 * //   2. Fácil olvidar excluir `status` al editar (bug silencioso).
 * //   3. Agregar un filtro nuevo obliga a tocar cada sitio que arma el body.
 * ----------------------------------------------------------------------------
 */
export class UserRequestBuilder {
  private body: UserRequestBody = {};

  /** Agrega los datos personales (comunes a crear y editar). */
  withPersonalData(data: UserFormData): this {
    this.body.firstName = data.firstName.trim();
    this.body.lastName = data.lastName.trim();
    this.body.phone = data.phone.trim();
    this.body.email = data.email.trim();
    this.body.dependencyId = data.dependencyId;
    return this;
  }

  /** Marca el request como "usuario nuevo": aplica la regla de estado Activo. */
  asNewUser(): this {
    this.body.status = UserStatus.Active;
    return this;
  }

  /** Fija explícitamente un estado (usado por el cambio de estado). */
  withStatus(status: UserStatus): this {
    this.body.status = status;
    return this;
  }

  /** Agrega un término de búsqueda libre (nombre completo o correo). */
  withSearch(term: string): this {
    const clean = term.trim();
    if (clean) {
      this.body.search = clean;
    }
    return this;
  }

  /** Filtra por dependencia. */
  withDependency(dependencyId: number): this {
    this.body.dependencyId = dependencyId;
    return this;
  }

  /** Devuelve el request body construido (copia inmutable). */
  build(): UserRequestBody {
    return { ...this.body };
  }
}
