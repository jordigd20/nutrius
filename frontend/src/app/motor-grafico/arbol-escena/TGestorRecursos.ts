import { TRecursoMalla } from './TRecursoMalla';
import { TRecursoMaterial } from './TRecursoMaterial';
import { TRecursoTextura } from './TRecursoTextura';
import { TRecursoShader } from './TRecursoShader';
import { HttpClient } from "@angular/common/http";

export class TGestorRecursos{
  private http: HttpClient;

  public recursosMalla: TRecursoMalla[];
  public recursosMaterial: TRecursoMaterial[];
  public recursosTextura: TRecursoTextura[];
  public recursosShader: TRecursoShader[];

  //numero de mallas (bases) para color picking
  public mall_num: number = 0;

  //malla seleccionada
  public obj_selec: number = -1;
  public dia: string="";

  //para el loader
  public n_modelos: number = 0;
  public n_modCarg: number = 0;
  public n_repes: number = 0;

  constructor(http: HttpClient){
    this.http = http;
    this.recursosMalla = [];
    this.recursosMaterial = [];
    this.recursosTextura = [];
    this.recursosShader = [];
  }

  public async getRecursosMalla (nombre: string, gl: WebGLRenderingContext, zoom: number, islaActual?: boolean, idMenu?: string){
    let rec = new TRecursoMalla(gl,this.http, this, zoom, islaActual, idMenu);
    let existe = false;

    let isla = "";
    let num = 1;
    let repe = false;
    // busco el recurso nombre en la lista de recursos
    for(let i = 0; i < this.recursosMalla.length; i++){
      if(this.recursosMalla[i].nombre == nombre){
        if(!nombre.startsWith("base")){
          rec = this.recursosMalla[i];
          existe=true;
          this.n_repes++;
        }
        else if(nombre.startsWith("base")){
          if(nombre.split("_")[1]){
            num=parseInt(nombre.split("_")[1])+1;
          }
          isla=nombre+"_"+num.toString();
          repe=true;
        }
      }
    }
    // si no existe, lo creo
    if(existe == false){
      if(repe==false){
        rec.setNombre(nombre);
      }
      else{
        rec.setNombre(isla);
      }
      await rec.cargarFichero(nombre, gl);
      this.recursosMalla.push(rec);
    }
    return rec;
  }

  public async getRecursosMaterial (nombre: string, num_mat:number, gl: WebGLRenderingContext){
    let rec = new TRecursoMaterial(this.http, this);
    let existe = false;


    for(let i = 0; i < this.recursosMaterial.length; i++){
      if(this.recursosMaterial[i].nombre == nombre){
        rec = this.recursosMaterial[i];
        existe = true;
      }
    }

    if(existe == false){
      rec.setNombre(nombre);
      await rec.cargarFichero(nombre,num_mat,gl);
      this.recursosMaterial.push(rec);
    }
    return rec;
  }

  public async getRecursosTextura (nombre: string, gl: WebGLRenderingContext){
    let rec = new TRecursoTextura(this.http);
    let existe = false;

    for(let i = 0; i < this.recursosTextura.length; i++){
      if(this.recursosTextura[i].nombre == nombre){
        rec = this.recursosTextura[i];
        existe=true;
      }
    }

    if(existe == false){
      rec.setNombre(nombre);
      await rec.cargarFichero(nombre, gl);
      this.recursosTextura.push(rec);
    }
    return rec;
  }

  public async getRecursosShader (nombre: string, gl: WebGLRenderingContext){
    let rec = new TRecursoShader(this.http);
    let existe = false;

    for(let i = 0; i < this.recursosShader.length; i++){
      if(this.recursosShader[i].nombre == nombre){
        rec = this.recursosShader[i];
        existe=true;
      }
    }

    if(existe == false){
      rec.setNombre(nombre);
      await rec.setShaders(gl);
      this.recursosShader.push(rec);
    }
    return rec;
  }
}
