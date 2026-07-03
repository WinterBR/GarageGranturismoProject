import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root shell: just hosts the router. The actual garage UI lives in
 * GarageShellComponent (behind the auth guard); the login screen lives in
 * LoginComponent. Splitting it this way keeps an unauthenticated visitor
 * from ever mounting the garage's data-loading logic.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
