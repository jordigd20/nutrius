import { mat4 } from 'gl-matrix';
import { TRecursoMalla } from './TRecursoMalla';
import { TRecursoTextura } from './TRecursoTextura';
import { HttpClient } from '@angular/common/http';
import { programInfo } from '../../interfaces/program-info.interface';
import { TRecursoMaterial } from './TRecursoMaterial';

export class TMalla{

  private http: HttpClient;
  public malla!: TRecursoMalla;
  // COLOR PICKING
  public obj_num: number = -1;
  public u_id: number[];
  public id_asignado: boolean = false;
  public obj_selec: number = -1;
  public dia: string = ""; // dia de hoy
  public hoy: boolean = false; // si es de la isla actual
  // MAR
  public mar: boolean = false;
  public ruido: WebGLTexture;
  // VALORES
  public vertices: number[];
  public normales: number[];
  public coordtex: number[];
  public indices: number[];
  public zoom: number = 0;
  // BUFFERS
  private bposition: any = null;
  private bindices: any = null;
  private btexture: any = null;
  private bnormal: any = null;
  // TEXTURA Y MATERIAL
  public texture: TRecursoTextura;
  public tex_gl: WebGLTexture;
  public material: TRecursoMaterial;
  public num_mat: number;
  // MUNDO
  public mundo: boolean = false;
  //IDMENU
  public idMenu: string;

  constructor(gl: WebGLRenderingContext, http: HttpClient){
    this.http = http;
  }

  async initBuffers(gl: WebGLRenderingContext){

    // vertex, posicion
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    // textura
    const texturaVert = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texturaVert);
    const texturaCoor = this.coordtex;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoor),gl.STATIC_DRAW);

    // luz
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    const vertexNormals = this.normales;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),gl.STATIC_DRAW);

    // indices
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

    this.bposition = positionBuffer;
    this.bindices = indexBuffer;
    this.btexture = texturaVert;
    this.bnormal = normalBuffer;
  }

  comprobarDia(){
    //Se comprueba el dia de la base y su situacion respecto al dia actual
    let ret=0;
    if(this.dia!=""){
      let fecha = new Date();
      let day = fecha.getDay();
      let dia: any;
      let dianum;
      switch(day){
        case 0: dia = "domingo"; break;
        case 1: dia = "lunes"; break;
        case 2: dia = "martes"; break;
        case 3: dia = "miercoles"; break;
        case 4: dia = "jueves"; break;
        case 5: dia = "viernes"; break;
        case 6: dia = "sabado"; break;
      }
      switch(this.dia){
        case "domingo": dianum=0; break;
        case "lunes": dianum=1; break;
        case "martes": dianum=2; break;
        case "miercoles": dianum=3; break;
        case "jueves": dianum=4; break;
        case "viernes": dianum=5; break;
        case "sabado": dianum=6; break;
      }
      if(this.dia==dia){
        ret=1; // es hoy
      }
      else if((dianum<day && dianum!=0) || day==0 || !this.hoy){
        ret=2; // es dia anterior
      }
      else{
        ret=3; // es dia siguiente
      }
    }

    return ret;
  }

  async asignarColor(gl: WebGLRenderingContext){
    //Se asigna un id almacenado como color unico para realizar el picking
    var id = this.obj_num;
    this.u_id = [
      ((id >>  0) & 0xFF) / 0xFF,
      ((id >>  8) & 0xFF) / 0xFF,
      ((id >> 16) & 0xFF) / 0xFF,
      ((id >> 24) & 0xFF) / 0xFF,
    ]
    this.id_asignado=true;
  }

  public async dibujar(gl: WebGLRenderingContext, matriz: mat4, progInfo: programInfo, watProgInfo: programInfo, selectProgInfo?: programInfo): Promise<void> {

    let programInfo = selectProgInfo || progInfo;

    gl.useProgram(programInfo.programId);

    if(!this.id_asignado && this.obj_num!=-1){
      await this.asignarColor(gl);
    }

    // CONSTANTES
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    if((typeof selectProgInfo !== 'undefined') && this.obj_num!=-1){ //color picking
      /*
        Para realizar el color picking hemos buscado informacion de muchas webs diferentes,
        pero principalmente nos hemos basado en esta:
        https://webglfundamentals.org/webgl/lessons/webgl-picking.html
      */

      gl.useProgram(programInfo.programId);
      gl.uniform4fv(programInfo.uniformLocations.uSampler, this.u_id);

      // BUFFER POSITION
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bposition);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, type, normalize, stride, offset);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      // BUFFER INDICES
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bindices);

      matriz[14] = this.zoom;

      gl.useProgram(programInfo.programId);
      gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, matriz);

      gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, offset);

    }
    else if((typeof selectProgInfo == 'undefined') && !this.mar){ //shader normal
      // BUFFER POSITION
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bposition);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, type, normalize, stride, offset);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      // BUFFER TEXTURE
      gl.bindBuffer(gl.ARRAY_BUFFER, this.btexture);
      gl.vertexAttribPointer(programInfo.attribLocations.texCoord, 2, type, normalize, stride, offset);
      gl.enableVertexAttribArray(programInfo.attribLocations.texCoord);

      // BUFFER NORMAL
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bnormal);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, type, normalize, stride, offset);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

      // colores de las bases de los dias
      let com = this.comprobarDia();
      if(this.obj_num!=-1 && this.obj_selec==this.obj_num && com!=3){ //seleccionado
        gl.uniform4f(programInfo.uniformLocations.uColor, 0.804, 0.361, 0.361, 1.0);
        localStorage.setItem('pick', this.obj_num.toString());
        localStorage.setItem('idmp', this.idMenu);
      }
      else if(com==1 && this.hoy){ //dia actual
        gl.uniform4f(programInfo.uniformLocations.uColor, 0.000, 1.000, 0.000, 1.0);
      }
      else if(this.obj_num!=-1 && (!this.hoy || com==2)){ //dias anteriores
        gl.uniform4f(programInfo.uniformLocations.uColor, 0.561, 0.737, 0.561, 1.0);
      }
      else{
        gl.uniform4f(programInfo.uniformLocations.uColor, 1.0, 1.0, 1.0, 1.0);
      }

      // BUFFER INDICES
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bindices);

      matriz[14] = this.zoom;

      gl.useProgram(programInfo.programId);
      gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, matriz);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.tex_gl);
      gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

      // Materiales
      gl.uniform3fv(programInfo.uniformLocations.materialKa, this.material.ka);
      gl.uniform3fv(programInfo.uniformLocations.materialKs, this.material.ks);
      gl.uniform3fv(programInfo.uniformLocations.materialKd, this.material.kd);
      gl.uniform1f(programInfo.uniformLocations.materialShininess, this.material.ns);

      if(this.material.mapaKd){
        gl.uniform1f(programInfo.uniformLocations.mapaKd, 1.0);
      }
      else{
        gl.uniform1f(programInfo.uniformLocations.mapaKd, 0.0);
      }

      if(this.mundo==true){
        gl.uniform1i(programInfo.uniformLocations.shaderCartoon, 0);
      }

      gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, offset);

    }
    else if((typeof selectProgInfo == 'undefined') && this.mar){ //shader mar
      /*
        El shader para la animacion del mar se ha realizado guiandonos por la siguiente publicacion:
        https://gamedev.stackexchange.com/questions/163689/how-to-animate-abstract-2d-top-down-water-texture
      */

      let programInfo = watProgInfo;
      gl.useProgram(programInfo.programId);

      // BUFFER POSITION
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bposition);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, type, normalize, stride, offset);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      // BUFFER TEXTURE
      gl.bindBuffer(gl.ARRAY_BUFFER, this.btexture);
      gl.vertexAttribPointer(programInfo.attribLocations.texCoord, 2, type, normalize, stride, offset);
      gl.enableVertexAttribArray(programInfo.attribLocations.texCoord);

      // BUFFER NORMAL
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bnormal);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, 3, type, normalize, stride, offset);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);

      // BUFFER INDICES
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bindices);

      matriz[14] = this.zoom;

      gl.useProgram(programInfo.programId);
      gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, matriz);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.tex_gl);
      gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

      // textura ruido
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.ruido);
      gl.uniform1i(programInfo.uniformLocations.normalMatrix, 1);

      gl.uniform1f(programInfo.uniformLocations.uColor, 0.2); //u_noise_scale
      gl.uniform2fv(programInfo.uniformLocations.ambientMode, new Float32Array([.0006, .0007])); //u_noise_scroll_velocity
      gl.uniform1f(programInfo.uniformLocations.lightIntensity, 0.003); //u_distortion

      // Segun la hora que sea se cambia el color del mar
      let d = new Date();
      let hour = d.getHours();
      if(hour>=7 && hour<=18){ //dia
        gl.uniform4f(programInfo.uniformLocations.lightDiffuse, 1.0, 1.0, 1.0, 1.0);
      }
      else if(hour>=19 && hour<21){ //atardecer
        gl.uniform4f(programInfo.uniformLocations.lightDiffuse, 0.184, 0.310, 0.310, 0.5);
      }
      else{ //noche
        gl.uniform4f(programInfo.uniformLocations.lightDiffuse, 0.098, 0.098, 0.439, 1);
      }

      // Materiales
      gl.uniform3fv(programInfo.uniformLocations.materialKa, this.material.ka);
      gl.uniform3fv(programInfo.uniformLocations.materialKs, this.material.ks);
      gl.uniform3fv(programInfo.uniformLocations.materialKd, this.material.kd);
      gl.uniform1f(programInfo.uniformLocations.materialShininess, this.material.ns);

      if(this.material.mapaKd){
        gl.uniform1f(programInfo.uniformLocations.mapaKd, 1.0);
      }
      else{
        gl.uniform1f(programInfo.uniformLocations.mapaKd, 0.0);
      }

      gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, offset);
    }

  }
}
