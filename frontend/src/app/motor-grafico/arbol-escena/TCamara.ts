import { mat4 } from 'gl-matrix';
import { TEntidad } from './TEntidad';
import { programInfo } from '../../interfaces/program-info.interface';
export class TCamara implements TEntidad{
  public tipo: string;
  public pintar: boolean;
  public esPerspectiva: boolean;
  private projectionMatrix: mat4 = mat4.create();
  public actualizarCamara: boolean = true;

  private aspecto: number;
  private fov: number;
  private cercano: number;
  private lejano: number;

  private izquierda: number;
  private derecha: number;
  private inferior: number;
  private superior: number;

  constructor() {}

  public setPerspectiva(fov: number, aspecto: number, cercano: number, lejano: number) {
    this.esPerspectiva = true;
    this.actualizarCamara = true;

    if(fov != null)
      this.fov = fov;

		if(aspecto != null)
      this.aspecto = aspecto;

		if(cercano != null)
      this.cercano = cercano;

		if(lejano != null)
      this.lejano = lejano;

    mat4.perspective(this.projectionMatrix, this.fov, this.aspecto, this.cercano, this.lejano);
  }

  public setParalela(izq: number, der: number, sup: number, inf: number, cerc: number, lej: number) {
    this.esPerspectiva = false;
    this.actualizarCamara = true;

    this.izquierda = izq;
    this.derecha = der;
    this.superior = sup;
    this.inferior = inf;
    this.cercano = cerc;
    this.lejano = lej;

    mat4.ortho(this.projectionMatrix, this.izquierda, this.derecha, this.inferior, this.superior, this.cercano, this.lejano);
  }

  public async dibujar(gl: WebGLRenderingContext, matriz: mat4, progInfo: programInfo, watProgInfo: programInfo, deltaTime?: number, selectProgInfo?: programInfo) {
    const programInfo = selectProgInfo || progInfo;
    gl.useProgram(programInfo.programId);

    if(this.actualizarCamara) {
      if(this.esPerspectiva) {
        let viewMatrix = mat4.create();
        mat4.invert(viewMatrix, matriz);
        mat4.mul(this.projectionMatrix, this.projectionMatrix, viewMatrix);
      } else {
        mat4.mul(this.projectionMatrix, this.projectionMatrix, matriz);
      }
      this.actualizarCamara = false;
    }

    if (programInfo.uniformLocations.projectionMatrix != null && programInfo.uniformLocations.modelViewMatrix != null) {
      gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, this.projectionMatrix);
      gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, matriz);
    }

    gl.useProgram(watProgInfo.programId);
    if (watProgInfo.uniformLocations.projectionMatrix != null && watProgInfo.uniformLocations.modelViewMatrix != null) {
      gl.uniformMatrix4fv(watProgInfo.uniformLocations.projectionMatrix, false, this.projectionMatrix);
      gl.uniformMatrix4fv(watProgInfo.uniformLocations.modelViewMatrix, false, matriz);
    }
  }

}
