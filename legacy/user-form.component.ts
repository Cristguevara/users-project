/**
 * =============================================================================
 * CÓDIGO "ANTES" (sin patrones) — formulario monolítico de crear/editar.
 * =============================================================================
 *
 * Versión original del formulario, antes de aplicar patrones. NO se compila con
 * la app actual; es referencia citable para la sustentación. La versión
 * refactorizada vive en:
 *   src/app/presentation/pages/user-form/user-form.component.ts
 *
 * Mapeo problema -> patrón en: legacy/DIAGNOSTICO.md
 */
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Dependency {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user-form-legacy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>{{ editingId ? 'Editar usuario' : 'Agregar usuario' }}</h2>
    <form (ngSubmit)="save()">
      <input [(ngModel)]="firstName" name="firstName" placeholder="Nombre" />
      <input [(ngModel)]="lastName" name="lastName" placeholder="Apellido" />
      <input [(ngModel)]="phone" name="phone" placeholder="Teléfono" />
      <input [(ngModel)]="email" name="email" placeholder="Correo" />
      <select [(ngModel)]="dependencyId" name="dependencyId">
        <option *ngFor="let d of dependencies" [value]="d.id">{{ d.name }}</option>
      </select>
      <button type="submit">Guardar</button>
    </form>
  `,
})
export class UserFormLegacyComponent implements OnInit {
  firstName = '';
  lastName = '';
  phone = '';
  email = '';
  dependencyId: number | null = null;
  editingId: number | null = null;
  dependencies: Dependency[] = [];

  // PROBLEMA A (Bridge): el formulario también conoce HttpClient y las URLs.
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // PROBLEMA A: acceso a datos incrustado en el componente.
    this.http
      .get<Dependency[]>('https://api.empresa.com/dependencies')
      .subscribe((deps) => (this.dependencies = deps));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId = Number(id);
      // PROBLEMA B (Command): "cargar usuario" es lógica de negocio embebida en la vista.
      this.http
        .get<any>('https://api.empresa.com/users/' + id)
        .subscribe((u) => {
          this.firstName = u.firstName;
          this.lastName = u.lastName;
          this.phone = u.phone;
          this.email = u.email;
          this.dependencyId = u.dependencyId;
        });
    }
  }

  save(): void {
    if (this.editingId) {
      // PROBLEMA E (Builder): body de edición armado a mano; hay que ACORDARSE
      // de NO enviar 'status' para no pisar el estado.
      const body = {
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        email: this.email,
        dependencyId: this.dependencyId,
      };
      this.http
        .put('https://api.empresa.com/users/' + this.editingId, body)
        .subscribe(() => this.router.navigate(['/']));
    } else {
      // PROBLEMA E (Builder) + PROBLEMA F (regla de negocio suelta):
      // la regla "usuario nuevo nace Activo" está escrita a mano aquí, en la UI.
      const body = {
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        email: this.email,
        dependencyId: this.dependencyId,
        status: 'Activo', // <-- regla de negocio incrustada en el componente
      };
      this.http
        .post('https://api.empresa.com/users', body)
        .subscribe(() => this.router.navigate(['/']));
    }
  }
}
