import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

import { User, UserStatus } from '@domain/models';
import { ChangeUserStatusUseCase, ListUsersUseCase } from '@domain/usecases';
import {
  renderCell,
  USER_TEXT_COLUMNS,
} from './user-column.renderers';

/**
 * Vista principal: lista de usuarios en una tabla de PrimeNG.
 *
 * NO conoce el repositorio ni HTTP: inyecta CASOS DE USO (patrón Command) y solo
 * llama `execute(...)`. Eso mantiene la Inversión de Dependencias: la vista
 * depende de la acción de negocio, no de cómo se obtienen los datos.
 *
 * El campo de búsqueda dispara `ListUsersUseCase` con un filtro; el repositorio
 * usa el Builder para construir el request del "backend".
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule, ButtonModule, TableModule, TagModule, InputTextModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly listUsers = inject(ListUsersUseCase);
  private readonly changeUserStatus = inject(ChangeUserStatusUseCase);
  private readonly router = inject(Router);

  readonly users = signal<User[]>([]);
  readonly loading = signal<boolean>(false);
  readonly changingStatusId = signal<number | null>(null);
  readonly searchTerm = signal<string>('');

  /** Columnas de texto resueltas por la tabla de despacho. */
  readonly textColumns = USER_TEXT_COLUMNS;

  ngOnInit(): void {
    this.loadUsers();
  }

  /** Consulta el listado al "backend" a través del caso de uso, con filtro. */
  loadUsers(): void {
    this.loading.set(true);
    this.listUsers.execute({ search: this.searchTerm() }).subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.loadUsers();
  }

  /** Texto de la celda vía dispatch table. */
  cell(user: User, columnId: string): string {
    return renderCell(user, columnId);
  }

  statusSeverity(status: UserStatus): 'success' | 'danger' {
    return status === UserStatus.Active ? 'success' : 'danger';
  }

  /** Etiqueta de la acción según el estado actual (dos estados, simple). */
  toggleLabel(user: User): string {
    return user.status === UserStatus.Active ? 'Inactivar' : 'Activar';
  }

  toggleIcon(user: User): string {
    return user.status === UserStatus.Active ? 'pi pi-ban' : 'pi pi-check-circle';
  }

  toggleSeverity(user: User): 'danger' | 'success' {
    return user.status === UserStatus.Active ? 'danger' : 'success';
  }

  goToCreate(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  goToEdit(user: User): void {
    this.router.navigate(['/usuarios/editar', user.id]);
  }

  /**
   * Cambia el estado vía caso de uso y, al responder el "backend", re-consulta
   * el listado (como pide el requisito: consultar de nuevo tras el cambio).
   */
  toggleStatus(user: User): void {
    const nextStatus =
      user.status === UserStatus.Active ? UserStatus.Inactive : UserStatus.Active;
    this.changingStatusId.set(user.id);
    this.changeUserStatus.execute({ id: user.id, status: nextStatus }).subscribe({
      next: () => {
        this.changingStatusId.set(null);
        this.loadUsers();
      },
      error: () => this.changingStatusId.set(null),
    });
  }
}
