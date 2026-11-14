import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';

import { Dependency, UserFormData } from '@domain/models';
import {
  CreateUserUseCase,
  GetDependenciesUseCase,
  GetUserByIdUseCase,
  UpdateUserUseCase,
} from '@domain/usecases';

/**
 * Formulario de creación/edición de usuarios (dos columnas).
 *
 * - Modo CREAR (ruta /usuarios/nuevo): campos vacíos; al guardar, el Builder
 *   dentro del repositorio arma el request con estado Activo. No se muestra el
 *   estado.
 * - Modo EDITAR (ruta /usuarios/editar/:id): carga el usuario por el `id` del
 *   path, precarga los campos y, al guardar, actualiza sin tocar el estado.
 *
 * Inyecta CASOS DE USO (patrón Command), no repositorios: la vista solo dispara
 * acciones de negocio y no conoce cómo se resuelven (Inversión de Dependencias).
 */
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MessageModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly getDependencies = inject(GetDependenciesUseCase);
  private readonly getUserById = inject(GetUserByIdUseCase);
  private readonly createUser = inject(CreateUserUseCase);
  private readonly updateUser = inject(UpdateUserUseCase);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly dependencies = signal<Dependency[]>([]);
  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
    email: ['', [Validators.required, Validators.email]],
    dependencyId: [null as number | null, [Validators.required]],
  });

  get isEditMode(): boolean {
    return this.editingId() !== null;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar usuario' : 'Agregar usuario';
  }

  ngOnInit(): void {
    this.loadDependencies();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editingId.set(Number(idParam));
      this.loadUserForEdit(Number(idParam));
    }
  }

  private loadDependencies(): void {
    this.getDependencies.execute().subscribe((deps) => this.dependencies.set(deps));
  }

  private loadUserForEdit(id: number): void {
    this.loading.set(true);
    this.getUserById.execute(id).subscribe({
      next: (user) => {
        if (user) {
          this.form.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            email: user.email,
            dependencyId: user.dependency.id,
          });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  hasError(control: string, error: string): boolean {
    const c = this.form.get(control);
    return !!c && c.touched && c.hasError(error);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const data: UserFormData = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      phone: raw.phone,
      email: raw.email,
      dependencyId: raw.dependencyId as number,
    };

    this.saving.set(true);
    const request$ = this.isEditMode
      ? this.updateUser.execute({ id: this.editingId() as number, data })
      : this.createUser.execute(data);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/']);
      },
      error: () => this.saving.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
