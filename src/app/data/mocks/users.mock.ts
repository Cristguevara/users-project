import { UserEntity, UserStatus } from '@domain/models';

/**
 * Estado inicial del "servidor" simulado (NO es una base de datos del front).
 *
 * Estos objetos tienen la forma EXACTA en que un backend REST devolvería los
 * usuarios (UserEntity): campos separados `firstName`/`lastName` y la clave
 * foránea `dependencyId`. La capa de datos los envuelve en un SuccessResponse
 * y los entrega tras un retardo, imitando una respuesta HTTP real.
 *
 * Coherencia con dependencies.mock.ts:
 *   dependencyId 1 -> Dependencia 1
 *   dependencyId 2 -> Dependencia 2
 *   dependencyId 3 -> Dependencia 3
 */
export const USERS_MOCK: UserEntity[] = [
  {
    id: 1,
    firstName: 'Ana',
    lastName: 'Ramírez',
    phone: '3001112233',
    email: 'ana.ramirez@empresa.com',
    dependencyId: 1,
    status: UserStatus.Active,
  },
  {
    id: 2,
    firstName: 'Carlos',
    lastName: 'Gómez',
    phone: '3012223344',
    email: 'carlos.gomez@empresa.com',
    dependencyId: 2,
    status: UserStatus.Active,
  },
  {
    id: 3,
    firstName: 'Lucía',
    lastName: 'Fernández',
    phone: '3023334455',
    email: 'lucia.fernandez@empresa.com',
    dependencyId: 3,
    status: UserStatus.Inactive,
  },
  {
    id: 4,
    firstName: 'Miguel',
    lastName: 'Torres',
    phone: '3034445566',
    email: 'miguel.torres@empresa.com',
    dependencyId: 1,
    status: UserStatus.Active,
  },
  {
    id: 5,
    firstName: 'Sofía',
    lastName: 'Castro',
    phone: '3045556677',
    email: 'sofia.castro@empresa.com',
    dependencyId: 2,
    status: UserStatus.Inactive,
  },
];
