import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage';
import { Observable, from, of, forkJoin } from 'rxjs';
import { switchMap, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { take, delay, tap, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

const STORAGE_REQ_KEY = 'storedreq';

interface StoredRequest {
  url: string,
  type: string,
  data: any,
  time: number,
  id: string
}

@Injectable({
  providedIn: 'root'
})
export class OfflineService {

  private _tieneConexion = new BehaviorSubject(null);

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private toastController: ToastController,
    private sqlite: SQLite,
    private network: Network,
    private authService: AuthService,
  ) { }

  // el objetivo de esta funcion es comprobar si existen requests almacenadas en el storage, de ser asi
  // se las envia al servidor
  checkForEvents(): Observable<any> {
    // transforma una promesa en un observable
    return from(this.storage.get(STORAGE_REQ_KEY)).pipe(
      switchMap(storedOperations => {
        // decodifica el json almacenado
        let storedObj = JSON.parse(storedOperations);
        // comprueba si hay o no request en el storage
        if (storedObj && storedObj.length > 0) {
          return this.sendRequests(storedObj).pipe(
            // crea un toast
            finalize(() => {
              let toast = this.toastController.create({
                message: `Local data succesfully synced to API!`,
                duration: 3000,
                position: 'bottom'
              });
              toast.then(toast => toast.present());

              // elimina las requests desde el estorage
              this.storage.remove(STORAGE_REQ_KEY);
            })
          );
        } else {
          // si no hubo request en el storage retorna un observable con valor false
          console.log('no local events to sync');
          return of(false);
        }
      })
    )
  }

  // 
  storeRequest(url, type, data) {
    let toast = this.toastController.create({
      message: `Tus datos se han guardado en el dispositivo.`,
      duration: 4000,
      position: 'bottom'
    });
    toast.then(toast => toast.present());

    let action: StoredRequest = {
      url: url,
      type: type,
      data: data,
      time: new Date().getTime(),
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
    };
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript

    return this.storage.get(STORAGE_REQ_KEY).then(storedOperations => {
      let storedObj = JSON.parse(storedOperations);

      if (storedObj) {
        storedObj.push(action);
      } else {
        storedObj = [action];
      }
      // Save OLD & NEW local transactions back to Storage
      return this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj));
    });
  }

  sendRequests(operations: StoredRequest[]) {
    return this.authService.headers.pipe(
      switchMap(headers => {
        let obs = [];
        for (let op of operations) {
          console.log('Make one request: ', op);
          let oneObs = this.http.request(op.type, op.url, {body: op.data, headers: headers});
          obs.push(oneObs);
        }
  
        // Send out all local events and return once they are finished
        // forkJoin permite ejecutar un ARRAY de observables
        return forkJoin(obs);
      })
    )
  }

  comprobarConexion() {
    if (this.network.type === 'wifi') {
      this._tieneConexion.next(true);
    }
    if (this.network.type === 'none') {
      this._tieneConexion.next(false);
    }
  }

  get tieneConexion() {
    return this._tieneConexion.asObservable().pipe(
      map(con => {
        if (this.network.type === 'wifi') {
          return true;
        } else {
          return false;
        }
      })
    );
  }

}
