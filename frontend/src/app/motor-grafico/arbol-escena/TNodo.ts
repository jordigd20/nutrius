import { vec3, mat4 } from 'gl-matrix';
import { TEntidad } from './TEntidad';
import { programInfo } from '../../interfaces/program-info.interface';
export class TNodo{

  private entidad!: TEntidad;
  private hijos: TNodo[] = [];
  private padre: TNodo;
  private traslacion: vec3 = [0, 0, 0];
  private rotacion: vec3 = [0, 0, 0];
  private escalado: vec3 = [1, 1, 1];
  private matrizTransf: mat4 = mat4.create();
  private actualizarMatriz: boolean = false;

  constructor() {}

  public addHijo(nodo: TNodo): void {
    this.hijos.push(nodo);
    nodo.padre = this;
  }

  public remHijo(nodo: TNodo): number {
    const array = [];
    for(let i = 0; i < this.hijos.length; i++) {
      if(this.hijos[i] !== nodo) array.push(this.hijos[i]);
    }
    this.hijos = array;
    nodo.padre = null;
    return this.hijos.length;
  }

  public setEntidad(ent: TEntidad) {
    this.entidad = ent;
  }

  public getEntidad(): TEntidad {
    return this.entidad;
  }

  public getPadre(): TNodo {
    return this.padre;
  }

  public async recorrer(matrizAcum: mat4, gl: WebGLRenderingContext, programInfo: programInfo, watProgInfo: programInfo, deltaTime: number, selectProgInfo?: programInfo) {
    if(this.actualizarMatriz) {
      this.actualizarMatriz = false;
      mat4.multiply(this.matrizTransf, matrizAcum, await this.calcularMatriz());
    }
    if(this.entidad != null){
      if((typeof selectProgInfo !== 'undefined')){
        await this.entidad.dibujar(gl, this.matrizTransf, programInfo, watProgInfo, deltaTime, selectProgInfo);
      }
      else{
        await this.entidad.dibujar(gl, this.matrizTransf, programInfo, watProgInfo, deltaTime);
      }
    }

    for (let i = 0; i < this.hijos.length; i++) {
      if(typeof selectProgInfo !== 'undefined'){
        this.hijos[i].recorrer(this.matrizTransf, gl, programInfo, watProgInfo, deltaTime, selectProgInfo);
      }
      else{
        this.hijos[i].recorrer(this.matrizTransf, gl, programInfo,watProgInfo,  deltaTime);
      }
    }
  }

  async calcularMatriz() {
    let matrizAux = mat4.create();
    mat4.translate(matrizAux, matrizAux, this.traslacion);
    mat4.rotate(matrizAux, matrizAux, this.convertirARadianes(this.rotacion[0]), [1, 0, 0]);
    mat4.rotate(matrizAux, matrizAux, this.convertirARadianes(this.rotacion[1]), [0, 1, 0]);
    mat4.rotate(matrizAux, matrizAux, this.convertirARadianes(this.rotacion[2]), [0, 0, 1]);
    mat4.scale(matrizAux, matrizAux, this.escalado);
    return matrizAux;
  }

  public setTraslacion(vector: vec3) {
    this.actualizarMatricesHijos();
    this.traslacion = vector;
  }

  public setRotacion(vector: vec3) {
    this.actualizarMatricesHijos();
    this.rotacion = vector;
  }

  public setEscalado( vector: vec3) {
    this.actualizarMatricesHijos();
    this.escalado = vector;
  }

  public trasladar( traslacion: vec3) {
    this.actualizarMatricesHijos();
    vec3.add(this.traslacion, this.traslacion, traslacion);
  }

  public rotar( rotacion: vec3) {
    this.actualizarMatricesHijos();
    vec3.add(this.rotacion, this.rotacion, rotacion);
  }

  public escalar( escalado: vec3) {
    this.actualizarMatricesHijos();
    vec3.add(this.escalado, this.escalado, escalado);
  }

  public getTraslacion(): vec3 {
    return this.traslacion;
  }

  public getRotacion(): vec3 {
    return this.rotacion;
  }

  public getEscalado(): vec3 {
    return this.escalado;
  }

  public setMatrizTransf( matriz: mat4) {
    this.matrizTransf = matriz;
  }

  public getMatrizTransf(): mat4 {
    return this.matrizTransf;
  }

  public getHijos(): TNodo[] {
    return this.hijos;
  }

  // Pone a true el actualizarMatriz del nodo y de los hijos
  private actualizarMatricesHijos() {
    this.actualizarMatriz = true;
    for(let i = 0; i < this.hijos.length; i++) {
      this.hijos[i].actualizarMatriz = true;
    }
  }

  private convertirARadianes(grados: number) {
    return grados * Math.PI / 180;
  }
}
