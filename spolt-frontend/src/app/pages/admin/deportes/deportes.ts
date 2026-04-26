import { Component, inject, OnInit, signal, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../service/admin.service';
import { List } from '../list/list';
import { TargetAction } from '../target/target';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-deportes-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, List, FormsModule],
  templateUrl: './deportes.html',
  styleUrl: './deportes.css',
  encapsulation: ViewEncapsulation.None
})
export class Deportes implements OnInit {
  private adminService = inject(AdminService);
  
  public deportes = signal<any[]>([]);
  public loading = false;

  // Confirmar Eliminación
  public mostrarConfirmacionEliminar = signal<boolean>(false);
  public deporteAEliminar = signal<any | null>(null);

  // Edición
  public mostrarModalEditar = signal<boolean>(false);
  public deporteAEditar = signal<any | null>(null);
  public edit_nombre = '';
  public edit_descripcion = '';
  public edit_imagen_icono = '';
  public edit_color = '#ff006e';

  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;

  // Creación
  public mostrarModalCrear = signal<boolean>(false);
  public crear_nombre = '';
  public crear_descripcion = '';
  public crear_imagen_icono = '';
  public crear_color = '#ff006e';

  @ViewChild('fileInputCrear') fileInputCrear!: ElementRef;
  selectedFileCrear: File | null = null;

  ngOnInit() {
    this.loadDeportes();
  }

  loadDeportes() {
    this.loading = true;
    this.adminService.getTotalDeportesList().subscribe({
      next: (res: any[]) => {
        this.deportes.set(res);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando deportes:', err);
        this.loading = false;
      }
    });
  }

  // Recibe acciones del hijo (list -> target)
  handleItemAction(event: TargetAction) {
    const item = event.item;
    switch (event.action) {
      case 'editar':
        this.abrirEditar(item);
        break;
      case 'eliminar':
        this.deporteAEliminar.set(item);
        this.mostrarConfirmacionEliminar.set(true);
        break;
    }
  }

  // ── ELIMINAR ──
  cerrarConfirmacionEliminar() {
    this.mostrarConfirmacionEliminar.set(false);
    this.deporteAEliminar.set(null);
  }

  confirmarEliminarDeporte() {
    const item = this.deporteAEliminar();
    if (item) {
      this.adminService.deleteDeporte(item.id_deporte).subscribe({
        next: () => {
          this.deportes.update(list => list.filter(d => d.id_deporte !== item.id_deporte));
          this.cerrarConfirmacionEliminar();
        },
        error: (err: any) => console.error('Error eliminando deporte:', err)
      });
    }
  }

  // ── EDITAR ──
  abrirEditar(item: any) {
    this.deporteAEditar.set(item);
    this.edit_nombre = item.nombre || '';
    this.edit_descripcion = item.descripcion || '';
    this.edit_imagen_icono = item.imagen_icono || '';
    this.edit_color = item.color || '#ff006e';
    this.selectedFile = null;
    this.mostrarModalEditar.set(true);
  }

  cerrarModalEditar() {
    this.mostrarModalEditar.set(false);
    this.deporteAEditar.set(null);
    this.selectedFile = null;
  }

  triggerFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.edit_imagen_icono = e.target.result; // Para la preview
      };
      reader.readAsDataURL(file);
    }
  }

  guardarEdicion() {
    const item = this.deporteAEditar();
    if (!item) return;

    if (this.selectedFile) {
      // Primero subimos la imagen si hay una nueva
      this.adminService.uploadImage(this.selectedFile).subscribe({
        next: (res: any) => {
          const imageUrl = `${environment.apiUrl}/storage/${res.objectName}`; 
          this.guardarDatos(item, imageUrl);
        },
        error: (err: any) => {
          console.error('Error subiendo imagen:', err);
          alert('Error al subir la imagen. Inténtalo de nuevo.');
        }
      });
    } else {
      // Guardamos directamente si no hay imagen nueva
      this.guardarDatos(item, this.edit_imagen_icono);
    }
  }

  private guardarDatos(item: any, imageUrl: string) {
    const data: any = {};
    if (this.edit_nombre.trim()) data.nombre = this.edit_nombre.trim();
    if (this.edit_descripcion.trim()) data.descripcion = this.edit_descripcion.trim();
    if (imageUrl.trim()) data.imagen_icono = imageUrl.trim();
    data.color = this.edit_color;

    this.adminService.updateDeporte(item.id_deporte, data).subscribe({
      next: (updated: any) => {
        this.deportes.update(list => list.map(d => 
          d.id_deporte === item.id_deporte ? { ...d, ...data } : d
        ));
        this.cerrarModalEditar();
      },
      error: (err: any) => console.error('Error editando deporte:', err)
    });
  }

  // ── CREAR ──
  abrirModalCrear() {
    this.crear_nombre = '';
    this.crear_descripcion = '';
    this.crear_imagen_icono = '';
    this.crear_color = '#ff006e';
    this.selectedFileCrear = null;
    this.mostrarModalCrear.set(true);
  }

  cerrarModalCrear() {
    this.mostrarModalCrear.set(false);
    this.selectedFileCrear = null;
  }

  triggerFileInputCrear() {
    if (this.fileInputCrear) {
      this.fileInputCrear.nativeElement.click();
    }
  }

  onFileSelectedCrear(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileCrear = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.crear_imagen_icono = e.target.result; // Para la preview
      };
      reader.readAsDataURL(file);
    }
  }

  guardarCreacion() {
    if (!this.crear_nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (this.selectedFileCrear) {
      this.adminService.uploadImage(this.selectedFileCrear).subscribe({
        next: (res: any) => {
          const imageUrl = `${environment.apiUrl}/storage/${res.objectName}`; 
          this.ejecutarCrear(imageUrl);
        },
        error: (err: any) => {
          console.error('Error subiendo imagen:', err);
          alert('Error al subir la imagen. Inténtalo de nuevo.');
        }
      });
    } else {
      this.ejecutarCrear(this.crear_imagen_icono);
    }
  }

  private ejecutarCrear(imageUrl: string) {
    const data: any = {
      nombre: this.crear_nombre.trim(),
    };
    if (this.crear_descripcion.trim()) data.descripcion = this.crear_descripcion.trim();
    if (imageUrl.trim()) data.imagen_icono = imageUrl.trim();
    data.color = this.crear_color;

    this.adminService.createDeporte(data).subscribe({
      next: (nuevo: any) => {
        this.deportes.update(list => [...list, nuevo]);
        this.cerrarModalCrear();
      },
      error: (err: any) => {
        console.error('Error creando deporte:', err);
        alert('Error al crear el deporte.');
      }
    });
  }
}
