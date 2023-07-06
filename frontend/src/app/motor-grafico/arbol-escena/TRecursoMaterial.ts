import { TRecurso } from "./TRecurso";
import { TRecursoTextura } from './TRecursoTextura';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TGestorRecursos } from './TGestorRecursos';
import { imagenConSrc } from '../../helpers/motorfunciones';
import { vec3 } from "gl-matrix";

export class TRecursoMaterial extends TRecurso{

  // archivos mtl que se exportan del modelado

  public coefLuz: number[];
  public recText: TRecursoTextura[];

  public ns: number;

  public ka: vec3;   //ambient
  public kd: vec3;   //diffuse
  public ks: vec3;   //specular
  public ke: vec3;   //emissive

  public ni: number;
  public d: number;
  public illum: number;

  public mapaKa: HTMLImageElement;    //ambient map
  public mapaKd: HTMLImageElement;    //diffuse map
  public mapaKs: HTMLImageElement;    //specular map
  public mapaKe: HTMLImageElement;    //emissive map

  public tex: TRecursoTextura;
  private http:  HttpClient;
  private gestor: TGestorRecursos;

  constructor(http: HttpClient, gestor: TGestorRecursos){
    super();
    this.http = http;
    this.gestor = gestor;
  }

  public async cargarFichero(nombre: string, num_mat:number, gl: WebGLRenderingContext){
    let nom = nombre.split('_');
    // leer formato mtl como json
    let archMaterial = await firstValueFrom(this.http.get('../../../assets/motor/materiales/'+nom[0]+'.mtl', {responseType: 'text'}));
    let materialJson = this.mtlToJson(archMaterial);

    await this.crearMaterial(materialJson.materiales[num_mat-1], gl);
  }

  public async crearMaterial(materialJson: any, gl: WebGLRenderingContext){

    if(materialJson){
      if(materialJson.Ns)
        this.ns = materialJson.Ns;

      if(materialJson.Ka)
        this.ka = materialJson.Ka;

      if(materialJson.Kd)
        this.kd = materialJson.Kd;

      if(materialJson.Ks)
        this.ks = materialJson.Ks;

      if(materialJson.Ke)
        this.ke = materialJson.Ke;

      if(materialJson.Ni)
        this.ni = materialJson.Ni;

      if(materialJson.d)
        this.d = materialJson.d;

      if(materialJson.illum)
        this.illum = materialJson.illum;

    }

    await this.cargarMapas(materialJson.map_Ka, materialJson.map_Kd, materialJson.map_Ks, materialJson.map_Ke, gl);

  }

  public async cargarMapas(srcMapaKa: string, srcMapaKd: string, srcMapaKe: string, srcMapaKs: string, gl: WebGLRenderingContext){

    if(srcMapaKa)
      this.mapaKa = await imagenConSrc(srcMapaKa);

    if(srcMapaKd){
      this.mapaKd = await imagenConSrc('../../../assets/motor/texturas/'+srcMapaKd);
      this.tex = await this.gestor.getRecursosTextura(srcMapaKd, gl);
    }
    else{
      this.tex = await this.gestor.getRecursosTextura('blanco.PNG', gl);
    }

    if(srcMapaKe)
      this.mapaKe = await imagenConSrc(srcMapaKe);

    if(srcMapaKs)
      this.mapaKs = await imagenConSrc(srcMapaKs);

  }

  public mtlToJson(archMaterial: string){

    let materialJsonText = '{';
    materialJsonText += '"materiales":[{';
    let lineas = archMaterial.split('\n');
    let esVect = false;

    for(let i = 3; i < lineas.length-1; i++){
      let partes = lineas[i].split(' ');
      if((partes[0]!=='') && (partes[0]!=='\r') && (lineas[i]!=='') && (lineas[i]!==' ')){
        if(partes[0] === "Ka" || partes[0] === "Kd"
         || partes[0] === "Ks" || partes[0] === "Ke"){
          materialJsonText += '"'+partes[0]+'":[';
          esVect = true;
         }
        else{
          materialJsonText += '"'+partes[0]+'":"';
        }

        for(let j = 1; j < partes.length; j++){
          materialJsonText += partes[j];
          if(j !== partes.length-1){
            materialJsonText += ',';
          }
        }
        if(esVect){
          materialJsonText += ']';
        }
        else{
          materialJsonText += '"';
        }
        esVect = false;
        if((i !== lineas.length-2) && (lineas[i+1]!=='') && (lineas[i+1]!=='\r')){
          materialJsonText += ',';
        }
      }
      else{
        materialJsonText += '}';
        if(i !== lineas.length-2){
          materialJsonText += ',{';
        }
      }

    }

    materialJsonText += '}]}';
    let matText = materialJsonText.replace(/(\r\n|\n|\r)/gm, "");
    let materialJson = JSON.parse(matText);

    return materialJson;
  }
}
