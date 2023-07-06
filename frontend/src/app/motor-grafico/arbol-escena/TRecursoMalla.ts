import { HttpClient } from "@angular/common/http";
import { mat4 } from "gl-matrix";
import { TMalla } from "./TMalla";
import { TRecurso } from "./TRecurso";
import { programInfo } from '../../interfaces/program-info.interface';
import { TGestorRecursos } from "./TGestorRecursos";

export class TRecursoMalla extends TRecurso{

  public mallas: TMalla[];
  private gl: WebGLRenderingContext;
  private http: HttpClient;
  private gestor: TGestorRecursos;
  private zoom: number;
  private islaActual: boolean;
  private idMenu: string;

  constructor(gl: WebGLRenderingContext, http: HttpClient, gestor: TGestorRecursos, zoom: number, islaActual?: boolean, idMenu?: string){
    super();
    this.gl = gl;
    this.http = http;
    this.gestor = gestor;
    this.mallas = [];
    this.zoom = zoom;
    this.islaActual = islaActual;
    this.idMenu = idMenu;
  }

  public async cargarFichero(nombre: string, gl: WebGLRenderingContext){
    const nombr: any = await this.http.get(`../../../assets/motor/modelos/${nombre}.json`).pipe().toPromise();
    //cada malla del recurso
    for(let i=0; i<nombr.meshes.length; i++){
      let nuevaMalla = new TMalla(this.gl, this.http);
      nuevaMalla.vertices = nombr.meshes[i].vertices;
      nuevaMalla.normales = nombr.meshes[i].normals;
      if(nombr.meshes[i].texturecoords){
        nuevaMalla.coordtex = nombr.meshes[i].texturecoords[0];
      }
      else{
        nuevaMalla.coordtex = [];
      }
      let ind = [];
      for(let z=0; z<nombr.meshes[i].faces.length; z++){
        for(let y=0; y<nombr.meshes[i].faces[z].length; y++){
          ind.push(nombr.meshes[i].faces[z][y]);
        }
      }
      nuevaMalla.indices = ind;
      nuevaMalla.num_mat = nombr.meshes[i].materialindex;
      nuevaMalla.zoom = this.zoom;
      nuevaMalla.hoy = this.islaActual;

      if(nombr.meshes[i].name.includes('base-color')){
        nuevaMalla.obj_num = this.gestor.mall_num+1;
        this.gestor.mall_num++;
        nuevaMalla.dia = nombr.meshes[i].name.split("_")[0];
        nuevaMalla.idMenu = this.idMenu;
      }

      // guardar materiales
      let mat = await this.gestor.getRecursosMaterial(nombre+'_'+i, nuevaMalla.num_mat, gl);
      nuevaMalla.material = mat;
      nuevaMalla.tex_gl = mat.tex.id;

      // si la malla es del mar
      if(nombre=="mar"){
        nuevaMalla.mar = true;
        let rect = await this.gestor.getRecursosTextura("noise.png", gl);
        nuevaMalla.ruido = rect.id;
      }

      if(nombre=="mundo"){
        nuevaMalla.mundo=true;
      }

      // iniciar buffers de la malla
      await nuevaMalla.initBuffers(gl);

      // meter nueva malla en array
      this.mallas.push(nuevaMalla);
    }
    this.gestor.n_modCarg++;
    var por = Math.floor(((this.gestor.n_modCarg+this.gestor.n_repes)/(this.gestor.n_modelos))*100);
    localStorage.setItem('porcentaje',por.toString());
  }

  public async dibujar(gl: WebGLRenderingContext, mat: mat4, programInfo: programInfo, watProgInfo: programInfo, pintar: boolean, selectProgInfo?: programInfo){
    if(pintar){
      for(let i=0; i<this.mallas.length; i++){
        this.mallas[i].obj_selec = this.gestor.obj_selec;
        if(this.mallas[i].obj_selec == this.mallas[i].obj_num){
          this.gestor.dia = this.mallas[i].dia;
        }
        if(selectProgInfo){
          await this.mallas[i].dibujar(gl, mat, programInfo, watProgInfo, selectProgInfo);
        }
        else{
          await this.mallas[i].dibujar(gl, mat, programInfo, watProgInfo);
        }
      }
    }
  }
}
