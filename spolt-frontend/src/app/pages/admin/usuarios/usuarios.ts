import { Component, inject, OnInit, signal, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../service/admin.service';
import { SportColorService } from '../../../shared/services/sport-color.service';
import { AuthService } from '../../../auth/services/auth.service';
import { List } from '../list/list';
import { TargetAction } from '../target/target';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, List],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  private adminService = inject(AdminService);
  private sportColorService = inject(SportColorService);
  private authService = inject(AuthService);
  private renderer = inject(Renderer2);
  private cdr = inject(ChangeDetectorRef);
  
  public currentUserRole = signal<string>('user');
  public usuariosFiltrados = signal<any[]>([]);
  public loading = false;

  // Paginación
  public paginaActual = signal<number>(1);
  public totalPaginas = signal<number>(1);
  public totalItems = signal<number>(0);
  public itemsPorPagina = 30;

  // Filtros
  public mostrarVentanaDeFiltros = signal<boolean>(false);
  public filtroBusqueda = signal<string>('');
  public filtroRol = signal<string>('');
  public filtroAnio = signal<string>('');

  // Modal de Perfil
  public mostrarPerfil = signal<boolean>(false);
  public usuarioSeleccionado = signal<any>(null);

  // Modal de Eliminación
  public mostrarConfirmacionEliminar = signal<boolean>(false);
  public usuarioAEliminar = signal<any>(null);

  // Modal de Amigos
  public mostrarAmigos = signal<boolean>(false);
  public amigosUsuario = signal<any[]>([]);

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (user) => {
        if (user) {
          this.currentUserRole.set(user.role);
        }
      }
    });
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.loading = true;
    this.cdr.detectChanges();

    this.adminService.getUsuariosList(this.paginaActual(), this.itemsPorPagina, this.filtroBusqueda(), this.filtroRol(), this.filtroAnio()).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.usuariosFiltrados.set(res.data);
          this.totalItems.set(res.meta?.total || res.data.length);
          this.totalPaginas.set(res.meta?.totalPages || Math.ceil(this.totalItems() / this.itemsPorPagina));
        } else if (Array.isArray(res)) {
          this.usuariosFiltrados.set(res);
          this.totalItems.set(res.length);
          this.totalPaginas.set(1);
        } else {
          this.usuariosFiltrados.set([]);
          this.totalItems.set(0);
          this.totalPaginas.set(1);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando usuarios:', err);
        this.usuariosFiltrados.set([]);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas()) {
      this.paginaActual.set(nuevaPagina);
      this.loadUsuarios();
    }
  }

  aplicarFiltros() {
    this.paginaActual.set(1);
    this.loadUsuarios();
    this.cerrarFiltros();
  }

  abrirFiltros() { 
    this.mostrarVentanaDeFiltros.set(true); 
    this.renderer.addClass(document.body, 'modal-open');
  }
  cerrarFiltros() { 
    this.mostrarVentanaDeFiltros.set(false); 
    this.renderer.removeClass(document.body, 'modal-open');
  }
  
  limpiarFiltros() {
    this.filtroBusqueda.set('');
    this.filtroRol.set('');
    this.filtroAnio.set('');
    this.paginaActual.set(1);
    this.loadUsuarios();
  }

  cerrarPerfil() {
    this.mostrarPerfil.set(false);
    this.usuarioSeleccionado.set(null);
    this.renderer.removeClass(document.body, 'modal-open');
  }

  cerrarConfirmacionEliminar() {
    this.mostrarConfirmacionEliminar.set(false);
    this.usuarioAEliminar.set(null);
    this.renderer.removeClass(document.body, 'modal-open');
  }

  cerrarAmigos() {
    this.mostrarAmigos.set(false);
    this.amigosUsuario.set([]);
    this.usuarioSeleccionado.set(null);
    this.renderer.removeClass(document.body, 'modal-open');
  }

  confirmarEliminarUsuario() {
    const user = this.usuarioAEliminar();
    if (!user) return;
    
    this.adminService.deleteUsuario(user.id_usuario).subscribe({
      next: () => {
        console.log('Usuario eliminado exitosamente');
        this.cerrarConfirmacionEliminar();
        this.loadUsuarios();
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        alert('Hubo un problema al intentar eliminar al usuario.');
        this.cerrarConfirmacionEliminar();
      }
    });
  }

  // Método auxiliar para obtener el amigo de una relación de amistad
  getAmigoDeAmistad(amistad: any, idUsuarioConsultado: number) {
    return amistad.id_usuario_solicitante === idUsuarioConsultado ? amistad.receptor : amistad.solicitante;
  }

  getSportColor(deporte: any): string {
    return this.sportColorService.getColor(deporte);
  }

  // Recibe acciones del hijo (list -> target)
  handleItemAction(event: TargetAction) {
    const item = event.item;
    switch (event.action) {
      case 'ver-perfil':
        this.usuarioSeleccionado.set(item);
        this.mostrarPerfil.set(true);
        this.renderer.addClass(document.body, 'modal-open');
        break;
      case 'ver-amigos':
        this.usuarioSeleccionado.set(item);
        this.adminService.getAmigosUsuario(item.id_usuario).subscribe({
          next: (amigos) => {
            this.amigosUsuario.set(amigos);
            this.mostrarAmigos.set(true);
            this.renderer.addClass(document.body, 'modal-open');
          },
          error: (err) => {
            console.error('Error cargando amigos:', err);
            alert('No se pudo cargar la lista de amigos.');
          }
        });
        break;
      case 'eliminar':
        this.usuarioAEliminar.set(item);
        this.mostrarConfirmacionEliminar.set(true);
        this.renderer.addClass(document.body, 'modal-open');
        break;
      case 'hacer-admin':
        if (confirm(`¿Estás seguro de hacer a ${item.nombre_usuario} administrador?`)) {
          this.adminService.updateUserRole(item.id_usuario, 'admin').subscribe({
            next: () => {
              alert(`${item.nombre_usuario} ahora es Administrador.`);
              this.loadUsuarios();
            },
            error: (err) => {
              console.error('Error actualizando rol:', err);
              alert('No se pudo cambiar el rol del usuario.');
            }
          });
        }
        break;
      case 'quitar-admin':
        if (confirm(`¿Estás seguro de quitar los permisos de administrador a ${item.nombre_usuario}?`)) {
          this.adminService.updateUserRole(item.id_usuario, 'user').subscribe({
            next: () => {
              alert(`${item.nombre_usuario} ahora es un Usuario normal.`);
              this.loadUsuarios();
            },
            error: (err) => {
              console.error('Error actualizando rol:', err);
              alert('No se pudo cambiar el rol del usuario.');
            }
          });
        }
        break;
    }
  }
}
