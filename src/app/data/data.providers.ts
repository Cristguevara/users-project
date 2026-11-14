import { Provider } from '@angular/core';
import { DependencyRepository, UserRepository } from '@domain/repositories';
import {
  ChangeUserStatusUseCase,
  CreateUserUseCase,
  GetDependenciesUseCase,
  GetUserByIdUseCase,
  ListUsersUseCase,
  UpdateUserUseCase,
} from '@domain/usecases';
import { UserHttpRepository } from './repositories/user-http.repository';
import { DependencyHttpRepository } from './repositories/dependency-http.repository';

/**
 * ============================================================================
 * PATRÓN CREACIONAL: Factory Method (vía el sistema de DI de Angular)
 * ============================================================================
 *
 * QUÉ ES:
 *   Factory Method delega la creación de un objeto a una función/método
 *   especializado, de modo que el cliente no usa `new` ni conoce cómo se
 *   resuelven las dependencias del objeto.
 *
 * CÓMO SE USA AQUÍ:
 *   Cada caso de uso se registra con una función `useFactory` que lo construye
 *   inyectándole el repositorio ABSTRACTO que necesita. Angular resuelve ese
 *   token abstracto a la implementación concreta (definida más abajo con
 *   `useClass`) y se lo pasa a la factory. Así, al pedir `ListUsersUseCase` en
 *   un componente, Angular ejecuta la factory y entrega el caso de uso ya
 *   cableado con su repositorio.
 *
 * POR QUÉ ESTE PATRÓN Y NO OTRO:
 *   Los casos de uso necesitan un repositorio para funcionar, pero NO deben
 *   saber qué implementación concreta es ni instanciarla. La factory centraliza
 *   ese ensamblaje en un solo lugar (composición). Se eligió Factory Method
 *   sobre instanciar con `new` en los componentes porque:
 *     - mantiene la Inversión de Dependencias (el caso de uso recibe la
 *       abstracción, no la concreta);
 *     - es extensible: agregar un caso de uso nuevo es agregar su factory sin
 *       tocar los componentes (OCP);
 *     - permite intercambiar la implementación del repositorio (mock ⇄ HTTP
 *       real) cambiando UN `useClass`, sin tocar factories ni vistas.
 *
 * ----------------------------------------------------------------------------
 * CÓMO SE VEÍA ANTES (SIN PATRÓN) — código problemático:
 * ----------------------------------------------------------------------------
 * // // El componente instanciaba todo a mano, conociendo las clases concretas:
 * //
 * //   export class UserListComponent {
 * //     private repo = new UserHttpRepository();          // clase concreta
 * //     private listUsers = new ListUsersUseCase(this.repo);
 * //   }
 * //
 * // Problemas concretos:
 * //   1. El componente depende de la implementación concreta (viola DIP).
 * //   2. El ensamblaje (qué repo usa cada caso de uso) queda repartido y
 * //      duplicado por todos los componentes que lo necesiten.
 * //   3. Cambiar de mock a backend real obliga a editar cada componente.
 * ----------------------------------------------------------------------------
 */

// --- Casos de uso construidos por factory con su(s) dependencia(s) ---

const listUsersFactory = (repo: UserRepository) => new ListUsersUseCase(repo);
export const ListUsersUseCaseProvider: Provider = {
  provide: ListUsersUseCase,
  useFactory: listUsersFactory,
  deps: [UserRepository],
};

const getUserByIdFactory = (repo: UserRepository) => new GetUserByIdUseCase(repo);
export const GetUserByIdUseCaseProvider: Provider = {
  provide: GetUserByIdUseCase,
  useFactory: getUserByIdFactory,
  deps: [UserRepository],
};

const createUserFactory = (repo: UserRepository) => new CreateUserUseCase(repo);
export const CreateUserUseCaseProvider: Provider = {
  provide: CreateUserUseCase,
  useFactory: createUserFactory,
  deps: [UserRepository],
};

const updateUserFactory = (repo: UserRepository) => new UpdateUserUseCase(repo);
export const UpdateUserUseCaseProvider: Provider = {
  provide: UpdateUserUseCase,
  useFactory: updateUserFactory,
  deps: [UserRepository],
};

const changeUserStatusFactory = (repo: UserRepository) => new ChangeUserStatusUseCase(repo);
export const ChangeUserStatusUseCaseProvider: Provider = {
  provide: ChangeUserStatusUseCase,
  useFactory: changeUserStatusFactory,
  deps: [UserRepository],
};

const getDependenciesFactory = (repo: DependencyRepository) => new GetDependenciesUseCase(repo);
export const GetDependenciesUseCaseProvider: Provider = {
  provide: GetDependenciesUseCase,
  useFactory: getDependenciesFactory,
  deps: [DependencyRepository],
};

/**
 * Enlace del patrón Bridge: aquí, y solo aquí, se conecta cada ABSTRACCIÓN
 * (UserRepository / DependencyRepository) con la IMPLEMENTACIÓN concreta que la
 * resuelve. Cambiar el origen de datos (mock -> backend real, u otra hermana)
 * es cambiar estos `useClass`, sin tocar abstracción ni consumidores.
 */
export const DATA_PROVIDERS: Provider[] = [
  ListUsersUseCaseProvider,
  GetUserByIdUseCaseProvider,
  CreateUserUseCaseProvider,
  UpdateUserUseCaseProvider,
  ChangeUserStatusUseCaseProvider,
  GetDependenciesUseCaseProvider,
  { provide: UserRepository, useClass: UserHttpRepository },
  { provide: DependencyRepository, useClass: DependencyHttpRepository },
];
