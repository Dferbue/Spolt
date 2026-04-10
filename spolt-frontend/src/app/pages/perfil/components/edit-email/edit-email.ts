import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PerfilService } from '../../service/perfil.service';

@Component({
  selector: 'app-edit-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-email.html',
  styleUrl: './edit-email.css',
})
export class EditEmail {
  @Input() emailActual: string = '';
  @Output() cerrar = new EventEmitter<void>();
  @Output() solicitarCambio = new EventEmitter<string>();

  emailForm!: FormGroup;
  loading = false;
  serverError = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService
  ) {}

  ngOnInit() {
    this.emailForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        this.differentEmailValidator(this.emailActual),
        this.commonDomainValidator()
      ]],
    });
  }

  private differentEmailValidator(currentEmail: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === currentEmail ? { isSameEmail: true } : null;
    };
  }

  private commonDomainValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !control.value.includes('@')) return null;
      
      const domain = control.value.split('@')[1].toLowerCase();
      const allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'outlook.es'];
      
      return allowedDomains.includes(domain) ? null : { invalidDomain: true };
    };
  }

  submit() {
    if (this.emailForm.invalid) return;

    this.loading = true;
    this.serverError = '';
    this.successMsg = '';

    const newEmail = this.emailForm.value.email;

    this.perfilService.solicitarCambioEmail(newEmail).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Se ha enviado un correo de confirmación a tu nueva dirección.';
        this.solicitarCambio.emit(newEmail);
        setTimeout(() => this.cerrar.emit(), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.serverError = err.error?.message || 'Error al solicitar el cambio de email';
      },
    });
  }
}
