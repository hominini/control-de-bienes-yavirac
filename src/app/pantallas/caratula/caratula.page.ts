import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../../auth/auth.service';
import { Router } from "@angular/router";
import { TareasService } from './../../services/tareas.service';
import { OfflineService } from './../../services/offline.service';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-caratula',
  templateUrl: './caratula.page.html',
  styleUrls: ['./caratula.page.scss'],
})
export class CaratulaPage implements OnInit, OnDestroy {

  constructor(
    private menu: MenuController,
    private authService: AuthService,
    private router: Router,
    private tareasService: TareasService,
    private offlineService: OfflineService,
    private network: Network,
    ) { }
  
  tareas: any = [];
  isOnline = null;
  private conexionSubscripcion: Subscription;
  disconnectSubscription: any;
  connectSubscription: any;

  pages = [
    {
      title: 'Inicio',
      url: 'caratula',
      icon: 'home',
    },
    {
      title: 'Tareas',
      children: [
        {
          title: 'Registro de Bienes',
          url: '/menu/main',
          icon: 'home',
        },
        {
          title: 'Conteo',
          url: '/menu/main',
          icon: 'logo-ionic',
        },
        {
          title: 'Dar de baja',
          url: '/menu/main',
          icon: 'logo-google',
        },
      ],
    },
  ];

  ngOnInit() {
    this.obtenerTareas();

    this.conexionSubscripcion = this.offlineService.tieneConexion.subscribe(resultado => {
      this.isOnline = resultado;
    });

    // watch network for a disconnection
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.offlineService.comprobarConexion();
    });
    
    // watch network for a connection
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      this.offlineService.comprobarConexion();
    });
  }

  ngOnDestroy() {
    if (this.disconnectSubscription) {
      console.log('conectado');
      this.disconnectSubscription.unsubscribe();
    }

    if (this.connectSubscription) {
      console.log('desconectado');
      this.connectSubscription.unsubscribe();
    }

    if (this.conexionSubscripcion) {
      this.conexionSubscripcion.unsubscribe();
    }
  }

  ionViewDidEnter() {
    // watch network for a disconnection
    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.isOnline = false;
    });

    // watch network for a connection
    this.connectSubscription = this.network.onConnect().subscribe(() => {
      this.isOnline = true;
    });
  }

  comprobarConexion() {
    this.offlineService.comprobarConexion();
  }

  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  openEnd() {
    this.menu.open('end');
  }

  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }
  
  salir() {
    this.authService.logout();
    this.router.navigateByUrl('login');
  }

  obtenerTareas() {
    this.tareasService.obtenerTareas()
      .subscribe(tareas => {
        console.log(tareas);
        this.tareas = tareas;
      });
  }
}
