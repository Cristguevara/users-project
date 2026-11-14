import { Routes } from '@angular/router';

/**
 * Rutas de la aplicación:
 *  - ''                    -> lista de usuarios (vista principal).
 *  - 'usuarios/nuevo'      -> formulario en modo creación.
 *  - 'usuarios/editar/:id' -> formulario en modo edición (el usuario se carga
 *                             por el parámetro `id` del path, como pide el
 *                             requisito).
 */
export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('@presentation/pages/user-list/user-list.component').then(
                (m) => m.UserListComponent
            ),
    },
    {
        path: 'usuarios/nuevo',
        loadComponent: () =>
            import('@presentation/pages/user-form/user-form.component').then(
                (m) => m.UserFormComponent
            ),
    },
    {
        path: 'usuarios/editar/:id',
        loadComponent: () =>
            import('@presentation/pages/user-form/user-form.component').then(
                (m) => m.UserFormComponent
            ),
    },
    { path: '**', redirectTo: '' },
];
