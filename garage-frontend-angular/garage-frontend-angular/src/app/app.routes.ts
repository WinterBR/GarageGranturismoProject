import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { GarageShellComponent } from './garage-shell.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: GarageShellComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
