import { Dependency } from './dependency.model';
import { UserStatus } from './user-status.enum';

/**
 * User = modelo de dominio/presentación que la interfaz de usuario consume.
 *
 * A diferencia de UserEntity (forma de BD), este modelo ya trae:
 *  - `fullName`: nombre completo calculado (nombre + apellido).
 *  - `dependency`: el objeto Dependency completo (no solo el id).
 *
 * La conversión entre UserEntity y User la realiza el Adapter, de modo que
 * la vista nunca tiene que conocer la forma interna de la base de datos.
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  dependency: Dependency;
  status: UserStatus;
}

/**
 * Datos que el formulario entrega al crear o editar un usuario.
 * No incluye `status` porque el estado NO se edita desde el formulario:
 *  - al crear, lo asigna la Factory (siempre Activo);
 *  - al editar, se conserva el estado previo.
 */
export interface UserFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dependencyId: number;
}
