import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ControlEventosService {
  eventEmitterFunction = new EventEmitter();
  constructor() {}

  emitir(pts: number) {
    const data = { pts };
    this.eventEmitterFunction.emit(JSON.stringify(data));
  }

  rutaPerfiles(ruta: string){
    this.eventEmitterFunction.emit(JSON.stringify(ruta));
  }

  mostrarModal(mostrar: boolean){
    const data = { mostrar }
    this.eventEmitterFunction.emit(JSON.stringify(data));
  }
}
