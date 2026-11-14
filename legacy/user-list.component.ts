/**
 * =============================================================================
 * CÓDIGO "ANTES" (sin patrones) — versión previa del proyecto.
 * =============================================================================
 *
 * Este archivo es la versión monolítica ORIGINAL de la lista de usuarios, antes
 * de aplicar patrones de diseño. NO se compila con la app actual: se conserva
 * como referencia citable (archivo:línea) del punto de partida para la
 * sustentación. La versión refactorizada vive en:
 *   src/app/presentation/pages/user-list/user-list.component.ts
 *
 * Todos los problemas de diseño están concentrados aquí a propósito. Ver el
 * mapeo problema -> patrón en: legacy/DIAGNOSTICO.md
 */
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Forma cruda tal como la devuelve el backend.
interface UserEntity {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dependencyId: number;
  status: string;
}

interface Dependency {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user-list-legacy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Usuarios</h2>
    <input [(ngModel)]="searchTerm" (keyup.enter)="loadUsers()" placeholder="Buscar" />
    <button (click)="goToCreate()">Agregar usuario</button>

    <table>
      <thead>
        <tr>
          <th>Nombre completo</th>
          <th>Teléfono</th>
          <th>Correo</th>
          <th>Dependencia</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of users">
          <!-- PROBLEMA C: nombre completo armado a mano en la plantilla (duplicado). -->
          <td>{{ u.firstName }} {{ u.lastName }}</td>
          <td>{{ u.phone }}</td>
          <td>{{ u.email }}</td>
          <!-- PROBLEMA C: la vista conoce dependencyId y resuelve el nombre por su cuenta. -->
          <td>{{ resolveDependencyName(u.dependencyId) }}</td>
          <td>{{ u.status }}</td>
          <td>
            <button (click)="goToEdit(u)">Editar</button>
            <!-- PROBLEMA D: if/else de estado repetido en la plantilla. -->
            <button (click)="toggleStatus(u)">
              {{ u.status === 'Activo' ? 'Inactivar' : 'Activar' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
})
export class UserListLegacyComponent implements OnInit {
  users: UserEntity[] = [];
  dependencies: Dependency[] = [];
  searchTerm = '';

  // PROBLEMA A (Bridge): el componente CONOCE el detalle de infraestructura
  // (HttpClient + URL). La operación de negocio y el origen de datos están
  // fundidos aquí; no se puede cambiar de fuente de datos sin editar la vista.
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    // PROBLEMA A: acceso a datos incrustado, con URL hardcodeada.
    this.http
      .get<Dependency[]>('https://api.empresa.com/dependencies')
      .subscribe((deps) => (this.dependencies = deps));
  }

  // PROBLEMA B (Command): la lógica de negocio "listar" vive dentro del
  // componente, mezclada con HTTP y con el armado del query. No es reutilizable
  // ni testeable de forma aislada.
  loadUsers(): void {
    // PROBLEMA E (Builder): el query se arma a mano, campo por campo.
    let url = 'https://api.empresa.com/users';
    if (this.searchTerm) {
      url += '?search=' + this.searchTerm;
    }
    this.http.get<UserEntity[]>(url).subscribe((data) => (this.users = data));
  }

  // PROBLEMA C (Adapter): resolución de la dependencia duplicada (aquí y en
  // cualquier otra vista que muestre usuarios).
  resolveDependencyName(dependencyId: number): string {
    const dep = this.dependencies.find((d) => d.id === dependencyId);
    return dep ? dep.name : 'Sin dependencia';
  }

  // PROBLEMA D (if/else de estado) + PROBLEMA A (HTTP directo):
  // el nuevo estado se calcula con un ternario incrustado y luego se refresca a
  // mano. Si se agrega un estado, hay que tocar esto Y la plantilla.
  toggleStatus(u: UserEntity): void {
    const nuevoEstado = u.status === 'Activo' ? 'Inactivo' : 'Activo';
    // PROBLEMA E (Builder): body de la petición armado inline.
    const body = { status: nuevoEstado };
    this.http
      .put<UserEntity>('https://api.empresa.com/users/' + u.id, body)
      .subscribe(() => {
        // hay que ACORDARSE de refrescar en cada acción.
        this.loadUsers();
      });
  }

  goToCreate(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  goToEdit(u: UserEntity): void {
    this.router.navigate(['/usuarios/editar', u.id]);
  }
}
