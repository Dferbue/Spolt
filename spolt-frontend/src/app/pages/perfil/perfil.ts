import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { HeaderAplicarion } from '../../layout/header-aplicarion/header-aplicarion';
import { PerfilService } from './service/perfil.service';
import { AuthService } from '../../auth/services/auth.service';
import { EditData } from './components/edit-data/edit-data';
import { EditEmail } from './components/edit-email/edit-email';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, Sidebar, HeaderAplicarion, EditData, EditEmail],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(
    private perflService: PerfilService,
    private cdr: ChangeDetectorRef
  ) {}

  dtoUser: any;
  activeForm: string | null = null;
  loadingAction = false;
  passwordEmailSent = false;
  emailChangeRequested = false;
  showLogoutConfirm = false; // Estado para el modal de logout móvil

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.perflService.getDataUser().subscribe((userData) => {
      this.dtoUser = userData;
      this.cdr.detectChanges();
    });
  }

  solicitudDeCambio(formName: string) {
    if (formName === 'password') {
      this.solicitarCambioPassword();
      return;
    }
    // Para email, seguimos necesitando que introduzca el nuevo email
    this.activeForm = this.activeForm === formName ? null : formName;
  }

  solicitarCambioPassword() {
    if (!this.dtoUser?.email) return;
    
    this.loadingAction = true;
    this.cdr.detectChanges();

    this.perflService.solicitarCambioPassword(this.dtoUser.email).subscribe({
      next: () => {
        this.loadingAction = false;
        this.passwordEmailSent = true;
        this.activeForm = null;
        this.cdr.detectChanges();

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.passwordEmailSent = false;
          this.cdr.detectChanges();
        }, 8000);
      },
      error: (err) => {
        this.loadingAction = false;
        this.cdr.detectChanges();
        alert(err.error?.message || 'Error al solicitar cambio de contraseña');
      }
    });
  }

  onEmailUpdateRequested(nuevoEmail: string) {
    this.loadingAction = true;
    this.cdr.detectChanges();

    this.perflService.solicitarCambioEmail(nuevoEmail).subscribe({
      next: () => {
        this.loadingAction = false;
        this.emailChangeRequested = true;
        this.activeForm = null;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.emailChangeRequested = false;
          this.cdr.detectChanges();
        }, 8000);
      },
      error: (err) => {
        this.loadingAction = false;
        this.cdr.detectChanges();
        alert(err.error?.message || 'Error al solicitar cambio de email');
      }
    });
  }

  onDatosActualizados() {
    this.loadUserData();
  }

  onCerrarForm() {
    this.activeForm = null;
  }

  toggleLogoutConfirm() {
    this.showLogoutConfirm = !this.showLogoutConfirm;
  }

  confirmLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error during logout:', err);
        this.router.navigate(['/']); // Fallback
      }
    });
  }
}
