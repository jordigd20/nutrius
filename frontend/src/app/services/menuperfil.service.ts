import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Data } from '@angular/router';
import { Observable } from 'rxjs';
import { MenuPerfil } from '../models/menuperfil.model';

@Injectable({
  providedIn: 'root'
})
export class MenuPerfilService {

  constructor(private http: HttpClient) { }

  cargarMenuPerfil( idmp: string, populate?:boolean ): Observable<object> {
    if(!populate) populate = false;
    return this.http.get(`${environment.base_url}/menu_perfil?id=${idmp}&populate=${populate}`, this.cabeceras);
  }

  cargarMenusPerfil( pid?: string, populate?:boolean, registropp?: number): Observable<object>{
    if(!pid) pid = '';
    if(!populate) populate = false;
    if (registropp == null) registropp = environment.registrosPorPagina;
    return this.http.get(`${environment.base_url}/menu_perfil?id=${pid}&populate=${populate}&registropp=${registropp}`, this.cabeceras);
  }

  actualizarMenuPerfil( idmp: string, data: MenuPerfil  ): Observable<object> {
    return this.http.put(`${environment.base_url}/menu_perfil/${idmp}`, data, this.cabeceras);
  }

  cambiarPlato( idmp: string, dia: string, comida: string, idPlato: string, idNuevoPlato: string, fecha: Date): Observable<object>{
    let data = '';
    return this.http.put(`${environment.base_url}/menu_perfil/cambiar_plato/${idmp}?dia=${dia}&comida=${comida}&plato=${idPlato}&nuevo_plato=${idNuevoPlato}&fechaMenu=${fecha}`, data, this.cabeceras);
  }

  cargarComidasHoy( perfilId: string): Observable<object>{
    return this.http.get(`${environment.base_url}/menu_perfil/comidas/hoy/${perfilId}`, this.cabeceras);
  }

  cargarComidasCompletadas( perfilId: string): Observable<object>{
    return this.http.get(`${environment.base_url}/menu_perfil/comidasCompletadas/${perfilId}`, this.cabeceras);
  }

  cargarComidasNoCompletadas( perfilId: string): Observable<object>{
    return this.http.get(`${environment.base_url}/menu_perfil/noCompletadas/${perfilId}`, this.cabeceras);
  }

  crearMenuPerfil( perfilId: string, menuId: string, body: Data): Observable<object>{
    return this.http.post(`${environment.base_url}/menu_perfil/${menuId}/${perfilId}`, body, this.cabeceras);
  }

  cargarMenusPerfilParam( uid: string, desde: number, textoBusqueda?: string, fechaDesde?: string, fechaHasta?: string, registropp?: number): Observable<object>{
    if (!desde) desde = 0;
    if (!textoBusqueda) textoBusqueda = '';
    if (!fechaDesde) fechaDesde = '';
    if (!fechaHasta) fechaHasta = '';
    if (registropp == null) registropp = environment.registrosPorPagina;
    return this.http.get(`${environment.base_url}/menu_perfil?id=${uid}&desde=${desde}&texto=${textoBusqueda}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&registropp=${registropp}`, this.cabeceras);
  }

  actualizarPuntos( idmp: string, data: MenuPerfil): Observable<object>{
    return this.http.put(`${environment.base_url}/menu_perfil/puntos/${idmp}`, data, this.cabeceras);
  }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get cabeceras() {
    return {
      headers: {
        'x-token': this.token
      }};
  }

}
