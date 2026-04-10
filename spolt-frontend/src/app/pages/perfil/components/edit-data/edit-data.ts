import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PerfilService } from '../../service/perfil.service';

@Component({
  selector: 'app-edit-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-data.html',
  styleUrl: './edit-data.css',
})
export class EditData {
  @Input() dtoUser: any;
  @Output() datosActualizados = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  datosForm!: FormGroup;
  loading = false;
  serverError = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService
  ) {}

  ngOnInit() {
    this.datosForm = this.fb.group({
      nombre_completo: [this.dtoUser?.nombre_completo || ''],
      biografia: [this.dtoUser?.biografia || ''],
      fecha_nacimiento: [this.formatDateForInput(this.dtoUser?.fecha_nacimiento)],
    });
  }

  // Convierte la fecha del backend al formato yyyy-MM-dd para el input date
  private formatDateForInput(date: string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  submit() {
    if (this.datosForm.invalid) return;

    this.loading = true;
    this.serverError = '';
    this.successMsg = '';

    // Solo enviamos los campos que tienen valor
    const data: any = {};
    const formValue = this.datosForm.value;

    if (formValue.nombre_completo) data.nombre_completo = formValue.nombre_completo;
    if (formValue.biografia !== undefined) data.biografia = formValue.biografia;
    if (formValue.fecha_nacimiento) data.fecha_nacimiento = formValue.fecha_nacimiento;

    this.perfilService.updateDatos(data).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Datos actualizados correctamente';
        this.datosActualizados.emit();
        setTimeout(() => this.cerrar.emit(), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.serverError = err.error?.message || 'Error al actualizar los datos';
      },
    });
  }
}
