import { vec3, mat4, vec4 } from 'gl-matrix';
import { programInfo } from 'src/app/interfaces/program-info.interface';
import { TEntidad } from './TEntidad';
export class TLuz implements TEntidad{
  public tipo: string;
  public pintar: boolean;
  private normalMatrix: mat4 = mat4.create();
  private tipoLuz!: string; // 'ambiente' || 'direccional'
  private posicion: vec4;
  private intensidad: vec3 = [1.0, 1.0, 1.0]; // rgb
  private ambient: vec3 = vec3.create();
  private diffuse: vec3 = vec3.create();
  private specular: vec3 = vec3.create();

  // Para luces focales
  private apertura: number;
  private atenAngular: number;

  private atenCte: number;
  private atenLineal: number;
  private atenCuadrat: number;

  constructor(tipoLuz: string) {
    this.tipoLuz = tipoLuz;
  }

  public getTipoLuz() {
    return this.tipoLuz;
  }

  public setIntensidad(intensidad: vec3) {
    this.intensidad = intensidad;
  }

  public getIntensidad() {
    return this.intensidad;
  }

  public setPropiedades(posicion: vec4, ambient: vec3, diffuse?: vec3, specular?: vec3) {
    this.posicion = posicion;
    this.ambient = ambient;
    if(diffuse) this.diffuse = diffuse;
    if(specular) this.specular = specular;
  }

  public setPosicion(posicion: vec4) {
    this.posicion = posicion;
  }

  public async dibujar(gl: WebGLRenderingContext, matriz: mat4, progInfo: programInfo, watProgInfo: programInfo, deltaTime?: number, selectProgInfo?: programInfo) {

    const programInfo = selectProgInfo || progInfo;
    gl.useProgram(programInfo.programId);
    mat4.invert(this.normalMatrix, matriz);
    mat4.transpose(this.normalMatrix, this.normalMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, this.normalMatrix);
    gl.uniform4fv(programInfo.uniformLocations.lightPosition, this.posicion);
    gl.uniform3fv(programInfo.uniformLocations.lightIntensity, this.intensidad);
    gl.uniform3fv(programInfo.uniformLocations.lightAmbient, this.ambient);
    gl.uniform3fv(programInfo.uniformLocations.lightDiffuse, this.diffuse);
    gl.uniform3fv(programInfo.uniformLocations.lightSpecular, this.specular);
    gl.uniform1i(programInfo.uniformLocations.shaderCartoon, 1);      //Poner a 1 para shader cartoon
    if(this.tipoLuz == 'ambiente') {
      gl.uniform1i(programInfo.uniformLocations.ambientMode, 1);
    }
    gl.useProgram(watProgInfo.programId);
    gl.uniformMatrix4fv(watProgInfo.uniformLocations.normalMatrix, false, this.normalMatrix);

  }


}
