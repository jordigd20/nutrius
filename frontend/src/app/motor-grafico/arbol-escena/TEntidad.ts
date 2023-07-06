import { mat4 } from 'gl-matrix';
import { programInfo } from '../../interfaces/program-info.interface';

export class TEntidad {
  public tipo: string;
  public pintar: boolean;

  constructor(){}

  public async dibujar(gl: WebGLRenderingContext, matriz: mat4, programInfo: programInfo, watProgInfo: programInfo, deltaTime?: number, selectProgInfo?: programInfo) {
  }

}
