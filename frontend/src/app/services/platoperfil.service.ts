import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { PlatoPerfil } from '../models/platoperfil.model';

@Injectable({
  providedIn: 'root'
})
export class PlatoPerfilService {

  constructor(private http: HttpClient) { }

  cargarPlatoPerfil( uid: string): Observable<object>{
    if(!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/plato_perfil?id=${uid}`, this.cabeceras);
  }

  cargarPlatosPerfil( desde: number, idPerfil: string, textoBusqueda?: string, comidas?: string, intolerancias?: string, registropp?: number ): Observable<object> {
    if (!desde) desde = 0;
    if (!textoBusqueda) textoBusqueda = '';
    if (!comidas) comidas = '';
    if (!intolerancias) intolerancias = '';
    if (registropp == null) registropp = environment.registrosPorPagina;
    return this.http.get(`${environment.base_url}/plato_perfil?desde=${desde}&perfil_id=${idPerfil}&texto=${textoBusqueda}&comidas=${comidas}&intolerancias=${intolerancias}&registropp=${registropp}`, this.cabeceras);
  }

  cargarPlatosPerfilComidos( desde: number, idPerfil: string, textoBusqueda?: string, registropp?: number ): Observable<object> {
    if (!desde) desde = 0;
    if (!textoBusqueda) textoBusqueda = '';
    if (registropp == null) registropp = environment.registrosPorPagina;
    return this.http.get(`${environment.base_url}/plato_perfil/comidos?desde=${desde}&perfil_id=${idPerfil}&texto=${textoBusqueda}&registropp=${registropp}`, this.cabeceras);
  }

  cargarPlatosPerfilMasFallados(idPerfil?: string, registropp?: number): Observable<object> {
    if (!idPerfil) idPerfil = '';
    if (registropp == null) registropp = environment.registrosPorPagina;
    return this.http.get(`${environment.base_url}/plato_perfil/masfallados/?perfil_id=${idPerfil}&registropp=${registropp}`, this.cabeceras);
  }

  cargarPlatosPerfilMasGustados(idPerfil?: string, registropp?: number): Observable<object> {
    if (!idPerfil) idPerfil = '';
    if (registropp == null) registropp = environment.registrosPorPagina;
    return this.http.get(`${environment.base_url}/plato_perfil/masgustados/?perfil_id=${idPerfil}&registropp=${registropp}`, this.cabeceras);
  }

  cargarPlatosPerfilMenosGustados(idPerfil?: string, registropp?: number): Observable<object> {
    if (!idPerfil) idPerfil = '';
    if (registropp == null) registropp = environment.registrosPorPagina;
    return this.http.get(`${environment.base_url}/plato_perfil/menosgustados/?perfil_id=${idPerfil}&registropp=${registropp}`, this.cabeceras);
  }

  actualizarPlatoPerfil( uid: string, data: PlatoPerfil): Observable<object>{
    return this.http.put(`${environment.base_url}/plato_perfil/${uid}`, data, this.cabeceras);
  }

  eliminarPlatoPerfil(uid: string): Observable<object> {
    return this.http.delete(`${environment.base_url}/plato_perfil/${uid}`, this.cabeceras);
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
