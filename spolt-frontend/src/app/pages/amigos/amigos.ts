import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { HeaderAplicarion } from '../../layout/header-aplicarion/header-aplicarion';
import { amigosService } from './service/amigos.service';
import { Amistad } from './models/amistad';
import { ListFriends } from './list-friends/list-friends';
import { toSignal } from '@angular/core/rxjs-interop';
import { Signal } from '@angular/core';
import { AmistadAction } from './models/asmitadAction';
import { MobileSwipeNavDirective } from '../../shared/directives/mobile-swipe-nav.directive';

@Component({
  selector: 'app-amigos',
  standalone: true,
  imports: [CommonModule, Sidebar, HeaderAplicarion, ListFriends, MobileSwipeNavDirective],
  templateUrl: './amigos.html',
  styleUrl: './amigos.css',
})
export class Amigos {

  private readonly amigosService = inject(amigosService);

  //Creamos una variable para para controlar si la pesñana emergente se esta mostrando
  wiewForm: boolean = false;
  tabActiva = signal("amigos");
  mensajeEnvio = signal('');

  //Creamos una funcionque cambie la variable para que se muestre la pestala emergente o la cierre
  cambioEstadoVentana() {
    this.wiewForm = !this.wiewForm;
  }

  // Creamos listas como Signals modificables
  public listFriends = signal<Amistad[]>([]);
  public listSolicitudesRecividas = signal<Amistad[]>([]);
  public listSolicitudesEnviadas = signal<Amistad[]>([]);

  // Cargamos el perfil como una Signal privada
  private readonly userProfile = toSignal(this.amigosService.getProfile(), { initialValue: null });

  // Computamos el nombre del usuario actual
  public readonly userNameActual = computed(() => this.userProfile()?.nombre_usuario || '');

  // Inicializamos los datos
  constructor() {
    this.refreshData();
  }

  // Función para volver a traer los datos del servidor sin recargar la página
  refreshData() {
    this.amigosService.friendsUser().subscribe(data => this.listFriends.set(data || []));
    this.amigosService.getSolicitudesAmistad().subscribe(data => this.listSolicitudesRecividas.set(data || []));
    this.amigosService.getSolicitudesEnviadas().subscribe(data => this.listSolicitudesEnviadas.set(data || []));
  }

  //Creamos la funcion para crear la amistad 
  sendFrindsShip(inputValue: string) {
    if (!inputValue) return;

    const isCode = inputValue.toUpperCase().startsWith('SPOLT-');
    
    const requestObservable = isCode 
      ? this.amigosService.sendFriendsShipByCode(inputValue)
      : this.amigosService.sendFriendsShip(inputValue);

    requestObservable.subscribe({
      next: (response) => {
        this.mensajeEnvio.set(`✅ Solicitud enviada con éxito a ${inputValue}`);
        this.refreshData(); // Recargamos para reflejar la solicitud en "Enviadas"
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Error al enviar la solicitud';
        this.mensajeEnvio.set(`❌ ${errorMsg}`);
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    })
  }

  //Creamos una funcion que nos va a enseñar la lista que marquemos
  mostrar(tab: string) {
    this.tabActiva.set(tab);
    // Cada vez que cambias de pestaña, recarga por si acaso, así siempre está fresco
    this.refreshData();
  }

  //Creamos la funcion con la uqe vamos a eliminar las amistades
  protected deleteAmistad(id_amistad: number) {
    this.amigosService.deleteAmistad(id_amistad.toString()).subscribe({
      next: (response) => {
        this.mensajeEnvio.set('✅ Se ha eliminado la amistad ');
        this.refreshData(); // <-- MAGIA AQUÍ: actualizamos sin F5
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      },
      error: (e) => {
        this.mensajeEnvio.set('❌ No se ha podido eliminar la amistad');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    });
  }

  //Creamos al funcion para aceptar las solictdes de amistad
  protected acceptAmistad(id_amistad: number) {
    this.amigosService.aceptSolcitudAmistad(id_amistad.toString()).subscribe({
      next: (response) => {
        this.mensajeEnvio.set('✅ Se ha aceptado la solicutud de amistad ');
        this.refreshData(); // <-- MAGIA AQUÍ: actualizamos sin F5
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      },
      error: (e) => {
        this.mensajeEnvio.set('❌ Error al eliminar la solicitud de amistad');
        setTimeout(() => this.mensajeEnvio.set(''), 3000);
      }
    });
  }

  //Esta fuincioin recogera los datos que nos trae el output y nos redigira y ara la funcion que hayamos selecionado
  protected selctFuntion(data: AmistadAction) {
    if (data.action === "eliminar") {
      this.deleteAmistad(data.amistad.id_amistad);
    } else if (data.action === "aceptar") {
      this.acceptAmistad(data.amistad.id_amistad);
    }
  }
}

