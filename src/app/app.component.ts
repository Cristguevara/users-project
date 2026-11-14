import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Shell de la aplicación: muestra el título global "Usuarios Empresa App"
 * y un <router-outlet> donde se renderiza la lista o el formulario.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly title = 'Usuarios Empresa App';
}
