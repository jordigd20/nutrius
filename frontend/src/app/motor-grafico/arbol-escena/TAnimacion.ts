import { TEntidad } from './TEntidad';
import { mat4 } from 'gl-matrix';
import { programInfo } from '../../interfaces/program-info.interface';
import { TMalla } from './TMalla';
import { Modelo } from 'src/app/interfaces/modelo-grafico.interface';

export class TAnimacion implements TEntidad {
  private mallas: TMalla[];
  private modelos: Modelo[];
  private mostrarAnimacion: boolean;
  private repetirAnimacion: boolean;
  public pintar: boolean;
  public tipo: string;

  public time: number = 0.0;
  public timeAux: number = 0.0;

  constructor(mallas: TMalla[], tipo: string, modelos: Modelo[]) {
    this.mallas = mallas;
    this.tipo = tipo;
    this.modelos = modelos;
    this.mostrarAnimacion = modelos[0].mostrarAnimacion;
    this.repetirAnimacion = modelos[0].repetirAnimacion;
  }

  public async dibujar(gl: WebGLRenderingContext, matriz: mat4, programInfo: programInfo, watProgInfo: programInfo, deltaTime: number) {

    if ((this.time-this.timeAux) >= 0.09) {
      if(this.mostrarAnimacion) this.animarModelo();
      this.timeAux = this.time;
    }

    if(this.mostrarAnimacion) {

      for (let i = 0; i < this.modelos.length; i++){
          if (this.modelos[i].pintar) {
            for(let j = 0; j < this.modelos[i].mallas.length; j++) {
              this.modelos[i].mallas[j].dibujar(gl, matriz, programInfo, watProgInfo);
            }
          }
      }

    }

    this.time += deltaTime;
  }

  public animarModelo() {
    let primero = 0;

    for (let i = 0; i < this.modelos.length; i++) {
      if (this.modelos[i].pintar) {
        this.modelos[i].pintar = false;

        if (this.modelos[i+1] != null) this.modelos[i+1].pintar = true;
        else this.modelos[primero].pintar = true;

        if(!this.repetirAnimacion && i == (this.modelos.length - 1)) {
          this.mostrarAnimacion = false;
        }

        break;
      }
    }
  }

  setMostrarAnimacion(mostrar: boolean) {
    this.mostrarAnimacion = mostrar;
  }

}
