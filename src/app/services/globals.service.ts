import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  public NOMBRE_SERVIDOR = 'http://192.168.1.5:8000'; 

  //http://192.168.1.5:8101, http://192.168.56.1:8101
  constructor() { }
}