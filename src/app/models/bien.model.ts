import { FileEntry } from '@ionic-native/file/ngx';

export class Bien {
    constructor(
      public codigo: string,
      public tipo: string,
      public nombre: string,
      public estado: string,
      public precio: number,
      public idUbicacion: string,
      public observaciones: string,
      public codigoPadre: string = '-1',
      public imagenBien: any,
    ) {}
  }
  