import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Perfil } from '../models/perfil.model';
import { Seguimiento } from '../models/seguimiento.model';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private perfil!: Perfil;

  constructor(private http: HttpClient) { }

  crearPerfil( data: Perfil ): Observable<object>{
    return this.http.post(`${environment.base_url}/perfiles`, data, this.cabeceras);
  }

  cargarPerfil( idPerfil: string): Observable<object>{
    return this.http.get(`${environment.base_url}/perfiles/perfil/${idPerfil}`, this.cabeceras);
  }

  cargarPerfiles( uidParent?: string, registropp?: number ): Observable<object> {
    if(!uidParent) uidParent = '';
    if (registropp == null) registropp = environment.registrosPorPagina;

    return this.http.get(`${environment.base_url}/perfiles?usuario=${uidParent}&registropp=${registropp}`, this.cabeceras);
  }

  actualizarPerfil( idPerfil: string, data: Perfil): Observable<object>{
    return this.http.put(`${environment.base_url}/perfiles/${idPerfil}`, data, this.cabeceras);
  }

  actualizarAvatar( idPerfil:string, a: string): Observable<object>{
    let data = '';
    return this.http.put(`${environment.base_url}/perfiles/avatar/${idPerfil}/${a}`, data, this.cabeceras);
  }

  cambiarEstadoPerfil( idPerfil: string): Observable<object>{
    let data = '';
    return this.http.put(`${environment.base_url}/perfiles/cambiar_estado/${idPerfil}`, data, this.cabeceras);
  }

  borrarPerfil(uid: string): Observable<object> {
    return this.http.delete(`${environment.base_url}/perfiles/${uid}`, this.cabeceras);
  }

  cargarPesoAltura(idPerfil: string): Observable<object>{
    return this.http.get(`${environment.base_url}/seguimiento/peso-y-altura/${idPerfil}`, this.cabeceras);
  }

  registrarPesoAltura(idPerfil: string, data: Seguimiento): Observable<object>{
    return this.http.post(`${environment.base_url}/seguimiento/peso-y-altura/${idPerfil}`, data, this.cabeceras);
  }

  cargarUsuario(uidParent: string): Observable<object> {
    return this.http.get(`${environment.base_url}/usuarios?id=${uidParent}`, this.cabeceras);
  }

  cargarSeguimientos( id: string){
    return this.http.get(`${environment.base_url}/seguimiento/peso-y-altura/${id}`, this.cabeceras);
  }

  registrarPeso( id: string, data: Seguimiento){
    return this.http.post(`${environment.base_url}/seguimiento/peso-y-altura/${id}`, data, this.cabeceras);
  }

  limpiarLocalStorage(): void {
    localStorage.removeItem('token');
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

  get uid(): string {
    return this.perfil.uid;
  }

}
