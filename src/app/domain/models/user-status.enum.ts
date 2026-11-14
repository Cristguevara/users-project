/**
 * Estado de un usuario dentro del sistema.
 * Un usuario recién creado siempre nace ACTIVO (regla de negocio centralizada
 * en la Factory, ver src/app/patterns/factory/user.factory.ts).
 */
export enum UserStatus {
  Active = 'Activo',
  Inactive = 'Inactivo',
}
