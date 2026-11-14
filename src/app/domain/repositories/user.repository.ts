import { Observable } from 'rxjs';
import { User, UserFilter, UserFormData, UserStatus } from '@domain/models';

/**
 * ============================================================================
 * PATRÓN ESTRUCTURAL: Bridge (Puente)
 * ============================================================================
 *
 * QUÉ ES:
 *   Bridge divide un grupo de clases estrechamente relacionadas en DOS
 *   jerarquías independientes —la ABSTRACCIÓN y la IMPLEMENTACIÓN— que pueden
 *   evolucionar por separado. La abstracción delega el trabajo real en un
 *   objeto de la jerarquía de implementación al que apunta (el "puente").
 *
 * CÓMO SE USA AQUÍ:
 *   - ABSTRACCIÓN: `UserRepository` (esta clase abstracta) define QUÉ
 *     operaciones de usuarios existen (list, create, update, changeStatus),
 *     sin decir CÓMO se resuelven ni de dónde vienen los datos.
 *   - IMPLEMENTACIÓN: la jerarquía de "orígenes de datos" que cumplen esas
 *     operaciones. Hoy hay una implementación, `UserHttpRepository`, que habla
 *     con el backend simulado; mañana podría existir `UserGraphqlRepository`,
 *     `UserIndexedDbRepository`, etc., como hermanas suyas.
 *   - EL PUENTE: los casos de uso (UseCase) sostienen una referencia al tipo
 *     abstracto `UserRepository`; Angular decide en `data.providers.ts` qué
 *     implementación concreta se enchufa (`useClass`). Abstracción e
 *     implementación quedan conectadas pero desacopladas.
 *
 *   Este es el ejemplo de "persistencia poliglota" que menciona el material del
 *   curso (bridge.ipynb): separar la entidad/operación de dominio del motor de
 *   almacenamiento, sin terminar con clases tipo `UserHttp`, `UserMongo`,
 *   `UserSql` mezclando ambas dimensiones.
 *
 * POR QUÉ ESTE PATRÓN Y NO OTRO:
 *   Aquí hay DOS dimensiones que varían de forma independiente: las OPERACIONES
 *   de negocio sobre usuarios, y el ORIGEN de los datos (mock hoy, HTTP real
 *   mañana). Bridge es justo el patrón para dos ejes de variación: evita la
 *   "explosión de clases" (no se crea una clase por cada combinación operación
 *   × origen) y permite intercambiar el origen sin tocar quien consume las
 *   operaciones. No es Abstract Factory porque estos métodos NO fabrican
 *   familias de objetos nuevos: ejecutan operaciones y devuelven su resultado
 *   (`Observable<User>`). No es solo Adapter porque no estamos amoldando una
 *   interfaz ajena existente, sino diseñando desde el inicio dos jerarquías
 *   pensadas para combinarse.
 *
 * ----------------------------------------------------------------------------
 * CÓMO SE VEÍA ANTES (SIN PATRÓN) — código problemático:
 * ----------------------------------------------------------------------------
 * // // La operación y el origen de datos venían fundidos en la misma clase, y
 * // // el componente conocía el detalle de infraestructura (HttpClient, URL):
 * //
 * //   export class UserListComponent {
 * //     users: User[] = [];
 * //     ngOnInit() {
 * //       this.http.get<User[]>('https://api.empresa.com/users')
 * //         .subscribe(u => this.users = u);
 * //     }
 * //   }
 * //
 * // Problemas concretos:
 * //   1. Abstracción (qué se hace) e implementación (cómo/dónde) fundidas: para
 * //      soportar otro origen habría que duplicar la clase por cada combinación
 * //      => explosión de clases (esto es lo que Bridge evita).
 * //   2. El componente depende de la clase concreta y de una URL: no testeable
 * //      sin HTTP real.
 * //   3. La lógica de acceso a datos queda duplicada en cada componente.
 * ----------------------------------------------------------------------------
 */
export abstract class UserRepository {
  /** Consulta usuarios, opcionalmente filtrados (simula GET /users?filtros). */
  abstract list(filter: UserFilter): Observable<User[]>;

  /** Trae un usuario por id (simula GET /users/:id). */
  abstract getById(id: number): Observable<User | undefined>;

  /** Crea un usuario nuevo (simula POST /users). */
  abstract create(data: UserFormData): Observable<User>;

  /** Actualiza los datos de un usuario existente (simula PUT /users/:id). */
  abstract update(id: number, data: UserFormData): Observable<User>;

  /** Cambia el estado de un usuario (simula PATCH /users/:id/status). */
  abstract changeStatus(id: number, status: UserStatus): Observable<User>;
}
