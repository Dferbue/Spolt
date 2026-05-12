import { Component, ChangeDetectorRef, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { HeaderAplicarion } from '../../layout/header-aplicarion/header-aplicarion';
import { PerfilService } from './service/perfil.service';
import { AuthService } from '../../auth/services/auth.service';
import { EditData } from './components/edit-data/edit-data';
import { EditEmail } from './components/edit-email/edit-email';
import { Deportes } from './deportes/deportes';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, Sidebar, HeaderAplicarion, EditData, EditEmail, Deportes],

  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly deleteAccountConfirmationText = 'ELIMINAR MI CUENTA';

  constructor(
    private perflService: PerfilService,
    private cdr: ChangeDetectorRef
  ) {}

  dtoUser: any;
  mainTabActive: 'perfil' | 'deportes' = 'perfil';
  activeForm: string | null = null;
  loadingAction = false;
  passwordEmailSent = false;
  emailChangeRequested = false;
  showLogoutConfirm = false; // Estado para el modal de logout móvil
  showPasswordConfirm = false; // Estado para el modal de confirmación de password
  showDeleteAccountConfirm = false;
  deleteAccountInput = '';
  deleteAccountError = '';
  deletingAccount = false;

  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  showImageConfirm = false;

  // Inicializa el componente cargando los datos del usuario
  ngOnInit() {
    this.loadUserData();
  }

  // Obtiene los datos del perfil de usuario desde el servicio de autenticación
  loadUserData() {
    this.authService.getProfile().subscribe((userData) => {
      this.dtoUser = userData;
      this.cdr.detectChanges();
    });
  }

  // Gestiona la apertura de los formularios de edición de contraseña o email
  solicitudDeCambio(formName: string) {
    if (formName === 'password') {
      this.showPasswordConfirm = true;
      this.cdr.detectChanges();
      return;
    }
    // Para email o datos
    this.activeForm = this.activeForm === formName ? null : formName;
  }

  // Cambia entre las pestañas principales Perfil/Deportes
  cambiarMainTab(tab: 'perfil' | 'deportes') {
    this.mainTabActive = tab;
    this.activeForm = null;
    this.cdr.detectChanges();
  }

  // Cierra el modal de confirmación de cambio de contraseña
  cancelPasswordConfirm() {
    this.showPasswordConfirm = false;
    this.cdr.detectChanges();
  }

  // Confirma el cambio de contraseña y ejecuta la solicitud
  confirmPasswordChange() {
    this.showPasswordConfirm = false;
    this.solicitarCambioPassword();
  }

  // Envía la solicitud de restablecimiento de contraseña al servidor
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

  // Procesa la solicitud de cambio de correo electrónico tras la validación
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

  // Recarga los datos del usuario cuando se han actualizado correctamente
  onDatosActualizados() {
    this.loadUserData();
  }

  // Cierra cualquier formulario de edición activo
  onCerrarForm() {
    this.activeForm = null;
  }

  // Alterna la visibilidad del modal de confirmación de cierre de sesión
  toggleLogoutConfirm() {
    this.showLogoutConfirm = !this.showLogoutConfirm;
  }

  openDeleteAccountConfirm() {
    this.showDeleteAccountConfirm = true;
    this.deleteAccountInput = '';
    this.deleteAccountError = '';
    this.cdr.detectChanges();
  }

  cancelDeleteAccount() {
    if (this.deletingAccount) return;

    this.showDeleteAccountConfirm = false;
    this.deleteAccountInput = '';
    this.deleteAccountError = '';
    this.cdr.detectChanges();
  }

  canConfirmDeleteAccount() {
    return this.deleteAccountInput.trim() === this.deleteAccountConfirmationText && !this.deletingAccount;
  }

  confirmDeleteAccount() {
    if (!this.canConfirmDeleteAccount()) return;

    const userId = this.dtoUser?.id_usuario;
    if (!userId) {
      this.deleteAccountError = 'No se ha podido identificar tu cuenta. Recarga el perfil e intentalo de nuevo.';
      this.cdr.detectChanges();
      return;
    }

    this.deletingAccount = true;
    this.deleteAccountError = '';
    this.cdr.detectChanges();

    this.perflService.deleteAccount(userId).subscribe({
      next: () => {
        this.authService.updateProfileState(null);
        this.authService.clearTokens();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.deletingAccount = false;
        this.deleteAccountError = err.error?.message || 'No se ha podido eliminar la cuenta.';
        this.cdr.detectChanges();
      }
    });
  }

  // Ejecuta el cierre de sesión y redirige al inicio
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

  // Dispara el selector de archivos oculto al hacer clic en el avatar
  triggerFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  // Maneja la selección de un archivo y genera una previsualización
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFilePreview = e.target.result;
        this.showImageConfirm = true;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  // Cancela la subida de imagen y limpia el estado de selección
  cancelImageUpload() {
    this.showImageConfirm = false;
    this.selectedFile = null;
    this.selectedFilePreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.cdr.detectChanges();
  }

  // Sube la imagen seleccionada al almacenamiento y actualiza el perfil
  uploadProfileImage() {
    if (!this.selectedFile) return;
    
    this.loadingAction = true;
    this.showImageConfirm = false;
    this.cdr.detectChanges();

    this.perflService.uploadAvatar(this.selectedFile).subscribe({
      next: (res: any) => {
        // Obtenemos la URL base del environment y añadimos la ruta de storage
        const apiUrl = this.perflService.getApiUrl(); // Necesitamos exponer esto o usar environment directamente
        const imageUrl = `${apiUrl}/storage/${res.objectName}`; 
        
        this.perflService.updateDatos({ imagen_perfil: imageUrl }).subscribe({
           next: (updatedUser) => {
              this.loadingAction = false;
              // Actualizamos el estado global para que el header se actualice al instante
              this.authService.updateProfileState(updatedUser);
              this.cancelImageUpload();
           },
           error: (err) => {
              this.loadingAction = false;
              alert('Imagen subida en Storage pero falló al actualizar el perfil en BD.');
              this.cancelImageUpload();
           }
        });
      },
      error: (err) => {
        this.loadingAction = false;
        alert(err.error?.message || 'Error al subir la imagen');
        this.cancelImageUpload();
      }
    });
  }
}
