import { TareasService } from './../../../../../services/tareas.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BienesService } from '../../../../../servicios/bienes.service';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ModalBajasPage } from './modal-bajas.page';
import { Location } from '@angular/common';
import { Baja } from 'src/app/models/baja.model';
import { Subscription } from 'rxjs';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-gestionar-bajas',
  templateUrl: './gestionar-bajas.page.html',
  styleUrls: ['./gestionar-bajas.page.scss'],
})
export class GestionarBajasPage implements OnInit {

  ubicacion: any;
  fecha: any;
  observaciones: any;
  bienes: any = [];
  idAsignacion: any;
  bajas: Baja[] = [];
  private bajasSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicioBienes: BienesService,
    private servicioTareas: TareasService,
    public alertController: AlertController,
    private modalController: ModalController,
    private tareasService: TareasService,
    private _location: Location,
    private file: File,
    private toastController: ToastController,
    private loadingController: LoadingController,
  ) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.ubicacion = this.router.getCurrentNavigation().extras.state.ubicacion;
        this.idAsignacion = this.router.getCurrentNavigation().extras.state.idAsignacion;
      }
    });
  }

  ngOnInit() {
    this.obtenerFechaActual();
    // this.obtenerBienes();
    this.servicioTareas.bajasTarea.subscribe(bajas => {
      console.log('bajas en gestionar-bajas', bajas);
      this.bajas = bajas;
    });
  }

  obtenerBienes() {
    this.servicioBienes.traerBienesDeUbicacion(this.ubicacion)
      .subscribe(bienes => {
        this.bienes = bienes.filter(bien => {
          return bien.is_baja !== 1;
        });
        // this.bienes = bienes;
      });
  }

  obtenerFechaActual() {
    this.fecha = new Date();
  }

  async mostrarModal() {
    const modal = await this.modalController.create({
      component: ModalBajasPage,
      componentProps: {
        idAsignacion: this.idAsignacion,
      },
    });

    modal.onDidDismiss()
      .then((data) => {
        if (data['data'].idDeleted !== -1) {
          this.bienes = this.bienes.filter(bien => {
            return bien.id !== data['data'].idDeleted;
          });
        }
      });

    return await modal.present();
  }

  async ingresarTarea(idTarea) {
    const alert = await this.alertController.create({
      header: '¿Terminar la tarea?',
      buttons: [
        {
          text: 'Sí',
          handler: () => {
            this.bajas.forEach(baja => {
              this.file.resolveLocalFilesystemUrl(baja.imgData.filePath)
                .then(entry => {
                  (<FileEntry>entry).file(file => this.readFile(file, baja));
                });
            });
            this.servicioTareas.completarTarea(idTarea).subscribe(respuesta => {
              this.tareasService.removerTarea(this.idAsignacion);
              this._location.back();
            });
          }
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }



  readFile(file: any, baja: Baja) {
    const reader = new FileReader();
    reader.onload = () => {
      const imgBlob = new Blob([reader.result], { type: file.type });
      const imgData = { blob: imgBlob, name: file.name };
      console.log(
        baja.codigoBien,
        this.idAsignacion,
        baja.motivoBaja,
        imgData,
      );
      this.servicioTareas.submitBaja(
        baja.codigoBien,
        this.idAsignacion,
        baja.motivoBaja,
        imgData,
      ).subscribe((_) => {
        console.log('dljfkadfjl');
      },
        (err) => {
          console.error("Error " + err)
        }
      )
    };
    reader.readAsArrayBuffer(file);
  }

  // startUpload(imgEntry) {
  //   this.file.resolveLocalFilesystemUrl(imgEntry.filePath)
  //     .then(entry => {
  //       (<FileEntry>entry).file(file => this.readFile(file, ''))
  //     })
  //     .catch(err => {
  //       this.presentToast('Error al leer el archivo.');
  //     });
  // }

  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      position: 'bottom',
      duration: 3000
    });
    toast.present();
  }

  ngOnDestroy() {
    if (this.bajasSub) {
      this.bajasSub.unsubscribe();
    }
  }

}


