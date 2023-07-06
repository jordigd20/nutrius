import { mat4 } from 'gl-matrix';
import { programInfo } from '../../interfaces/program-info.interface';
import { TEntidad } from './TEntidad';
import { TRecursoMalla } from './TRecursoMalla';
import { TGestorRecursos } from './TGestorRecursos';

export class TModel implements TEntidad{
  public recMalla: TRecursoMalla;
  public pintar: boolean;
  public tipo: string;

  constructor(tipo: string, pintar: boolean){
    this.tipo = tipo;
    this.pintar = pintar;
  }

  public async cargarRecursoMalla(nombre: string, gestor: TGestorRecursos, gl: WebGLRenderingContext, zoom: number, islaActual: boolean, idMenu?: string) {
    this.recMalla = await gestor.getRecursosMalla(nombre, gl, zoom, islaActual, idMenu);
  }

  public async dibujar(gl: WebGLRenderingContext, matriz: mat4, programInfo: programInfo, watProgInfo: programInfo, deltaTime?: number, selectProgInfo?: programInfo) {
    if(selectProgInfo)
      await this.recMalla.dibujar(gl,matriz,programInfo, watProgInfo,this.pintar, selectProgInfo);
    else
      await this.recMalla.dibujar(gl,matriz,programInfo, watProgInfo,this.pintar);
  }

}
