import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CarFormModalComponent } from './components/car-form-modal/car-form-modal.component';
import { CarTableComponent } from './components/car-table/car-table.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { GarageHeaderComponent } from './components/garage-header/garage-header.component';
import { ToastComponent } from './components/toast/toast.component';
import { Car } from './models/car.model';
import { AuthService } from './services/auth.service';
import { AudioService } from './services/audio.service';
import { GarageStateService } from './services/garage-state.service';

@Component({
  selector: 'app-garage-shell',
  standalone: true,
  imports: [
    CommonModule,
    GarageHeaderComponent,
    FilterBarComponent,
    CarTableComponent,
    CarFormModalComponent,
    ConfirmModalComponent,
    ToastComponent,
  ],
  templateUrl: './garage-shell.component.html',
  styleUrl: './garage-shell.component.css',
})
export class GarageShellComponent implements OnInit, OnDestroy {
  @ViewChild('formModal')    formModal!:    CarFormModalComponent;
  @ViewChild('confirmModal') confirmModal!: ConfirmModalComponent;
  @ViewChild('toast')        toast!:        ToastComponent;

  constructor(
    public  state:       GarageStateService,
    private authService: AuthService,
    private router:      Router,
    private audio:       AudioService,
  ) {
    // Plays the error sfx whenever a backend error first appears
    // (e.g. countries/brands/cars failing to load).
    effect(() => {
      if (this.state.error()) this.audio.playSfx('error');
    });
  }

  ngOnInit(): void {
    this.state.loadAll();
    this.audio.play('garage');
  }

  ngOnDestroy(): void {
    this.audio.stop();
  }

  onNewCar(): void {
    this.formModal.openForCreate();
  }

  onEditCar(car: Car): void {
    this.formModal.openForEdit(car);
  }

  onRemoveCar(car: Car): void {
    this.confirmModal.show(car);
  }

  onCarSaved(car: Car): void {
    this.state.selectCar(car.id);
    this.toast.show(`${car.name} saved.`);
  }

  onCarDeleted(car: Car): void {
    this.toast.show(`${car.name} removed from the garage.`);
  }

  onDeleteFailed(message: string): void {
    this.toast.show(message, true);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
