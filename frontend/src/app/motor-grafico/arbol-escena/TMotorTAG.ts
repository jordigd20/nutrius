
import { TNodo, TGestorRecursos, TEntidad, TCamara, TMalla, TLuz } from '../arbol-escena'
import { mat4, vec3, vec4 } from 'gl-matrix';
import { HttpClient } from '@angular/common/http';
import { programInfo } from 'src/app/interfaces/program-info.interface';
import { TModel } from './TModel';
import { Modelo } from 'src/app/interfaces/modelo-grafico.interface';
import { TAnimacion } from './TAnimacion';
export class TMotorTAG {
  private http: HttpClient;

  public escena: TNodo;
  private gestorRecursos: TGestorRecursos;
  private camara: TNodo;
  private eCamara: TCamara;
  private luz: TNodo;
  private eLuz: TLuz;
  public modelos: TNodo[];

  public obj_selec: number = -1;
  public dia: string = "";
  public idEscena: number = 0;

  public programInfo: programInfo;
  private programId: WebGLProgram;

  public selectProgInfo: programInfo;
  private selectProgId: WebGLProgram;

  public watProgInfo: programInfo;
  private watProgId: WebGLProgram;

  constructor(http: HttpClient) {
    this.http = http;
    this.gestorRecursos = new TGestorRecursos(http);
    this.modelos = [];
  }

  public async crearEscena(gl: WebGLRenderingContext, escenaId: number) {
    this.idEscena=escenaId;
    this.escena = this.crearNodo(null, null, vec3.create(), [1, 1, 1], vec3.create());

    if(escenaId === 4 || escenaId === 10) {
      const traslacion: vec3 = [0, -10, 0];
      const escalado: vec3 = [2.5, 2.5, 2.5];
      const rotacion: vec3 = [30, 0, 0];
      this.crearCamaraParalela(gl, traslacion, escalado, rotacion);
    } else {
      const traslacion: vec3 = [0, 0, 0];
      const escalado: vec3 = [1, 1, 1];
      const rotacion: vec3 = [0, 0, 0];
      this.crearCamaraPerspectiva(gl, traslacion, escalado, rotacion);
    }

    // Crear luz
    let tipoLuz = 'direccional';
    if (escenaId === 2) {
      tipoLuz = 'ambiente';
      const posicion: vec4 = [0, 0, 0, 1];
      const ambient: vec3 = [0.95, 0.95, 0.95];
      this.crearLuz(tipoLuz, posicion, ambient);
    } else {
      const posicion: vec4 = [0, 10, 0, 1];
      const ambient: vec3 = [0.4, 0.4, 0.4];
      const diffuse: vec3 = [0.8, 0.8, 0.8];
      const specular: vec3 = [1.0, 1.0, 1.0];
      this.crearLuz(tipoLuz, posicion, ambient, diffuse, specular);
    }

  }

  public crearNodo(padre: TNodo, entidad: TEntidad, traslacion: vec3, escalado: vec3, rotacion: vec3): TNodo {
    let nuevoNodo = new TNodo();

    if(entidad != null)
      nuevoNodo.setEntidad(entidad);

    if(padre != null)
      padre.addHijo(nuevoNodo);

    nuevoNodo.setTraslacion(traslacion);
    nuevoNodo.setEscalado(escalado);
    nuevoNodo.setRotacion(rotacion);

    return nuevoNodo;
  }

  public crearCamaraPerspectiva(gl: WebGLRenderingContext, traslacion: vec3, escalado: vec3, rotacion: vec3) {
    const canvasWidth = gl.canvas.clientWidth;
    const canvasHeight = gl.canvas.clientHeight;

    this.eCamara = new TCamara();
    this.eCamara.setPerspectiva(80 * Math.PI / 180, canvasWidth / canvasHeight, 0.1, 100);
    this.camara = this.crearNodo(this.escena, this.eCamara, traslacion, escalado, rotacion);
  }

  public crearCamaraParalela(gl: WebGLRenderingContext, traslacion: vec3, escalado: vec3, rotacion: vec3) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const viewSize = 52;

    this.eCamara = new TCamara();
    this.eCamara.setParalela(windowWidth / -viewSize, windowWidth / viewSize, windowHeight / viewSize, windowHeight / -viewSize, 1, 1000);
    this.camara = this.crearNodo(this.escena, this.eCamara, traslacion, escalado, rotacion);
  }

  public crearLuz(tipoLuz: string, posicion: vec4, ambient: vec3, diffuse?: vec3, specular?: vec3) {
    this.eLuz = new TLuz(tipoLuz);
    if(diffuse && specular)
      this.eLuz.setPropiedades(posicion, ambient, diffuse, specular);
    else
      this.eLuz.setPropiedades(posicion, ambient);
    this.luz = this.crearNodo(this.escena, this.eLuz, [posicion[0], posicion[1], posicion[2]], [1, 1, 1], [0, 0, 0]);
  }

  public async crearMalla(fichero: string, gl: WebGLRenderingContext, traslacion: vec3, escalado: vec3, rotacion: vec3, zoom: number, tipo: string, pintar: boolean, islaActual: boolean, idMenu?: string) {
    let nuevoModelo = new TModel(tipo, pintar);
    await nuevoModelo.cargarRecursoMalla(fichero, this.gestorRecursos, gl, zoom, islaActual, idMenu);
    this.modelos.push(this.crearNodo(this.escena, nuevoModelo, traslacion, escalado, rotacion));
  }

  public async crearModeloAnimado(modelos: Modelo[], gl: WebGLRenderingContext) {
    const mallasAnimacion: TMalla[] = [];
    for(let i = 0; i < modelos.length; i++) {
      const recursoMalla = await this.gestorRecursos.getRecursosMalla(modelos[i].nombre, gl, modelos[i].zoom, false);
      modelos[i].mallas = [];
      for(let j = 0; j < recursoMalla.mallas.length; j++) {
        modelos[i].mallas.push(recursoMalla.mallas[j]);
        mallasAnimacion.push(recursoMalla.mallas[j]);
      }
    }

    const tAnimacion: TAnimacion = new TAnimacion(mallasAnimacion, modelos[0].tipo, modelos);
    this.modelos.push(this.crearNodo(this.escena, tAnimacion, modelos[0].traslacion, modelos[0].escalado, modelos[0].rotacion));
  }

  public async createShaderInfo(gl: WebGLRenderingContext) {
    // SHADER NORMAL
    const rShader = await this.gestorRecursos.getRecursosShader('normal',gl);
    this.programId = rShader.getProgramId();

    this.programInfo = {
      programId: this.programId,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(this.programId, 'a_VertexPosition'),
        vertexNormal: gl.getAttribLocation(this.programId, 'a_VertexNormal'),
        texCoord: gl.getAttribLocation(this.programId, 'a_TexCoord'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(this.programId, 'u_ProjectionMatrix'),
        modelViewMatrix:  gl.getUniformLocation(this.programId, 'u_ModelViewMatrix'),
        normalMatrix: gl.getUniformLocation(this.programId, 'u_NormalMatrix'),
        uSampler: gl.getUniformLocation(this.programId, 'u_Sampler'),
        uColor: gl.getUniformLocation(this.programId, 'u_Color'),
        ambientMode: gl.getUniformLocation(this.programId, 'u_AmbientLightMode'),
        lightIntensity: gl.getUniformLocation(this.programId, 'u_LightIntensity'),
        lightPosition: gl.getUniformLocation(this.programId, 'Light.Position'),
        lightAmbient: gl.getUniformLocation(this.programId, 'Light.La'),
        lightDiffuse: gl.getUniformLocation(this.programId, 'Light.Ld'),
        lightSpecular: gl.getUniformLocation(this.programId, 'Light.Ls'),
        materialKa: gl.getUniformLocation(this.programId, 'Material.Ka'),
        materialKs: gl.getUniformLocation(this.programId, 'Material.Ks'),
        materialKd: gl.getUniformLocation(this.programId, 'Material.Kd'),
        materialShininess: gl.getUniformLocation(this.programId, 'Material.Shininess'),
        shaderCartoon: gl.getUniformLocation(this.programId, 'u_ShaderCartoon'),
        mapaKd: gl.getUniformLocation(this.programId, 'Material.MapaKd'),
      }
    }

    // SHADER SELECT
    const selShader = await this.gestorRecursos.getRecursosShader('select',gl);
    this.selectProgId = selShader.getProgramId();

    this.selectProgInfo = {
      programId: this.selectProgId,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(this.selectProgId, 'a_position'),
        vertexNormal: gl.getAttribLocation(this.selectProgId, ''),
        texCoord: gl.getAttribLocation(this.selectProgId, ''),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(this.selectProgId, 'u_matrix_pro'),
        modelViewMatrix:  gl.getUniformLocation(this.selectProgId, 'u_matrix_view'),
        normalMatrix: gl.getUniformLocation(this.selectProgId, ''),
        uSampler: gl.getUniformLocation(this.selectProgId, 'u_id'),
        uColor: gl.getUniformLocation(this.selectProgId, ''),
        ambientMode: gl.getUniformLocation(this.selectProgId, ''),
        lightIntensity: gl.getUniformLocation(this.selectProgId, ''),
        lightPosition: gl.getUniformLocation(this.selectProgId, ''),
        lightAmbient: gl.getUniformLocation(this.selectProgId, ''),
        lightDiffuse: gl.getUniformLocation(this.selectProgId, ''),
        lightSpecular: gl.getUniformLocation(this.selectProgId, ''),
        materialKa: gl.getUniformLocation(this.selectProgId, ''),
        materialKs: gl.getUniformLocation(this.selectProgId, ''),
        materialKd: gl.getUniformLocation(this.selectProgId, ''),
        materialShininess: gl.getUniformLocation(this.selectProgId, ''),
        shaderCartoon: gl.getUniformLocation(this.selectProgId, ''),
        mapaKd: gl.getUniformLocation(this.selectProgId, ''),
      }
    }

    // SHADER WATER
    const watShader = await this.gestorRecursos.getRecursosShader('water',gl);
    this.watProgId = watShader.getProgramId();

    this.watProgInfo = {
      programId: this.watProgId,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(this.watProgId, 'a_position'),
        vertexNormal: gl.getAttribLocation(this.watProgId, 'a_color'),
        texCoord: gl.getAttribLocation(this.watProgId, 'a_texCoord'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(this.watProgId, 'u_projTrans'),
        modelViewMatrix:  gl.getUniformLocation(this.watProgId, 'u_mv'),
        normalMatrix: gl.getUniformLocation(this.watProgId, ''),
        uSampler: gl.getUniformLocation(this.watProgId, 'u_texture'),
        uColor: gl.getUniformLocation(this.watProgId, 'u_noise_scale'),
        ambientMode: gl.getUniformLocation(this.watProgId, 'u_noise_scroll_velocity'),
        lightIntensity: gl.getUniformLocation(this.watProgId, 'u_distortion'),
        lightPosition: gl.getUniformLocation(this.watProgId, 'u_time'),
        lightAmbient: gl.getUniformLocation(this.watProgId, 'u_noise'),
        lightDiffuse: gl.getUniformLocation(this.watProgId, 'u_Color'),
        lightSpecular: gl.getUniformLocation(this.watProgId, ''),
        materialKa: gl.getUniformLocation(this.watProgId, ''),
        materialKs: gl.getUniformLocation(this.watProgId, ''),
        materialKd: gl.getUniformLocation(this.watProgId, ''),
        materialShininess: gl.getUniformLocation(this.watProgId, ''),
        shaderCartoon: gl.getUniformLocation(this.watProgId, ''),
        mapaKd: gl.getUniformLocation(this.watProgId, ''),
      }
    }

  }

  public async dibujarEscena(gl: WebGLRenderingContext, deltaTime: number, select: boolean) {

    if(localStorage.getItem('motor')=='false'){
      this.gestorRecursos.n_repes=0;
      this.idEscena=0;
    }
    else{
      let cargadas = this.gestorRecursos.recursosMalla.length-9+this.gestorRecursos.n_repes;
      if(cargadas==this.modelos.length && this.modelos.length>0 && this.idEscena==10 && localStorage.getItem('motor')=='true'){
        localStorage.setItem('recursos', 'true');
      }

      this.gestorRecursos.obj_selec = this.obj_selec;
      this.dia = this.gestorRecursos.dia;
      if(select){
        gl.useProgram(this.selectProgId);
        await this.escena.recorrer(mat4.create(), gl, this.programInfo, this.watProgInfo, deltaTime, this.selectProgInfo);
      }
      else{
        gl.useProgram(this.programId);
        await this.escena.recorrer(mat4.create(), gl, this.programInfo, this.watProgInfo, deltaTime);
      }
    }

  }

  async crearModelos(modelos: Modelo[], gl: WebGLRenderingContext){
    this.gestorRecursos.n_modelos=modelos.length;
    // Se agrupan todas las mallas por su tipo
    const modelosAgrupados = this.agruparPorTipos(modelos, (modelo: Modelo) => modelo.tipo);

    for (const [clave, valor] of modelosAgrupados) {
     if(valor[0].frame != 0) {
      await this.crearModeloAnimado(valor, gl);
     } else {
       for(let i = 0; i < valor.length; i++) {
         await this.crearMalla(valor[i].nombre,gl, valor[i].traslacion, valor[i].escalado, valor[i].rotacion, valor[i].zoom, valor[i].tipo, valor[i].pintar, valor[i].islaActual, valor[i].idMenu);
       }
     }
    }

  }

  public actualizarLuz() {}
  public setLuzActiva() {}

  public cambiarCamaraAPerspectiva(gl: WebGLRenderingContext) {
    const canvasWidth = gl.canvas.clientWidth;
    const canvasHeight = gl.canvas.clientHeight;

    this.eCamara.setPerspectiva(80 * Math.PI / 180, canvasWidth / canvasHeight, 0.1, 100);
  }

  public cambiarCamaraAParalela(gl: WebGLRenderingContext) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const viewSize = 52;

    this.escena.setTraslacion([0, 0, 0]);
    this.eCamara.setParalela(windowWidth / -viewSize, windowWidth / viewSize, windowHeight / viewSize, windowHeight / -viewSize, 1, 1000);
    const traslacion: vec3 = [0, -20.2, 0];
    const escalado: vec3 = [5.15, 5.15, 5.15];
    const rotacion: vec3 = [30, 0, 0];
    this.camara.setTraslacion(traslacion);
    this.camara.setEscalado(escalado);
    this.camara.setRotacion(rotacion);
  }

  public zoomIsla(gl: WebGLRenderingContext, traslacion: vec3, escalado: vec3, rotacion: vec3) {
    const canvasWidth = gl.canvas.clientWidth;
    const canvasHeight = gl.canvas.clientHeight;

    this.escena.setTraslacion([0, 0, 0]);
    this.eCamara.setPerspectiva(80 * Math.PI / 180, canvasWidth / canvasHeight, 0.1, 100);
    this.camara.setTraslacion(traslacion);
    this.camara.setEscalado(escalado);
    this.camara.setRotacion(rotacion);
  }

  public trasladarEscena(traslacion: number, limiteMayor: number, limiteMenor: number) {
    let nuevaPosicion = this.escena.getTraslacion()[0] + traslacion;

    if(nuevaPosicion >= limiteMayor) nuevaPosicion = limiteMayor;
    if(nuevaPosicion <= limiteMenor) nuevaPosicion = limiteMenor;

    this.escena.setTraslacion([nuevaPosicion, this.escena.getTraslacion()[1], this.escena.getTraslacion()[2]]);
  }

  public setTraslacionEscena(traslacion: vec3) {
    this.escena.setTraslacion(traslacion);
  }

  public mostrarAnimacion(tipoAnimacion: string) {
    for(let i = 0; i < this.escena.getHijos().length; i++) {
      if (this.escena.getHijos()[i].getEntidad() instanceof TAnimacion &&
          this.escena.getHijos()[i].getEntidad().tipo == tipoAnimacion) {
            (this.escena.getHijos()[i].getEntidad() as TAnimacion).setMostrarAnimacion(true);
      }
    }
  }

  public actualizarCamara(gl: WebGLRenderingContext) {
    const canvasWidth = gl.canvas.clientWidth;
    const canvasHeight = gl.canvas.clientHeight;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const viewSize = 52;

    this.escena.setTraslacion([0, 0, 0]);
    if(this.eCamara.esPerspectiva){

      this.eCamara.setPerspectiva(80 * Math.PI / 180, canvasWidth / canvasHeight, 0.1, 100);
      this.eCamara.actualizarCamara = true;

      this.camara.setTraslacion([this.camara.getTraslacion()[0], this.camara.getTraslacion()[1], this.camara.getTraslacion()[2]]);
    } else {
      this.eCamara.setParalela(windowWidth / -viewSize, windowWidth / viewSize, windowHeight / viewSize, windowHeight / -viewSize, 1, 1000);
    }
  }

  public trasladarLuz(traslacion: vec3) {
    this.eLuz.setPosicion([traslacion[0], traslacion[1], traslacion[2], 1]);
  }

  /*
    Función basada en el código esta página:
    https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
  */
  public agruparPorTipos(list: any[], keyGetter: CallableFunction): Map<string, any[]> {
    const map = new Map();
    for(let i = 0; i < list.length; i++) {
      const key = keyGetter(list[i]);
      const collection = map.get(key);
      if(!collection) map.set(key, [list[i]]);
      else collection.push(list[i]);
    }
    return map;
  }

}
