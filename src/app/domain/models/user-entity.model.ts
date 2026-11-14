import { UserStatus } from './user-status.enum';

/**
 * UserEntity = forma "cruda" tal como estaría almacenada en la base de datos.
 *
 * Nota clave para el patrón Adapter (ver src/app/patterns/adapter):
 * la BD NO guarda el objeto Dependency completo ni el "nombre completo".
 * Solo guarda la clave foránea `dependencyId` y los campos por separado
 * (`firstName`, `lastName`). Esto es lo que una tabla real devolvería.
 */
export interface UserEntity {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dependencyId: number;
  status: UserStatus;
}
