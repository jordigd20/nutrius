import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Plato } from '../models/plato.model';

@Injectable({
  providedIn: 'root'
})
export class PlatoService {

  constructor(private http: HttpClient) { }

  cargarPlato( uid: string): Observable<object>{
    if(!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/platos?id=${uid}`, this.cabeceras);
  }
  cargarPlatos( desde: number, uid?: string, admin?: string, textoBusqueda?: string, comidas?: string, intolerancias?: string, registropp?: number): Observable<object> {
    if (!desde) desde = 0;
    if (!uid) uid = '';
    if (!admin) admin = '';
    if (!textoBusqueda) textoBusqueda = '';
    if (!comidas) comidas = '';
    if (!intolerancias) intolerancias = '';
    if (registropp == null) registropp = environment.registrosPorPagina;
    return this.http.get(`${environment.base_url}/platos?desde=${desde}&uid=${uid}&admin=${admin}&texto=${textoBusqueda}&comidas=${comidas}&intolerancias=${intolerancias}&registropp=${registropp}`, this.cabeceras);
  }

  crearPlato( data: Plato ): Observable<object>{
    return this.http.post(`${environment.base_url}/platos/`, data, this.cabeceras);
  }

  actualizarPlato( uid: string, data: Plato): Observable<object>{
    return this.http.put(`${environment.base_url}/platos/${uid}`, data, this.cabeceras);
  }

  eliminarPlato(uid: string): Observable<object> {
    return this.http.delete(`${environment.base_url}/platos/${uid}`, this.cabeceras);
  }

  subirImagen(uid:string, fd: FormData): Observable<Object>{
    return this.http.put(`${environment.base_url}/platos/imagen/${uid}`, fd, this.cabeceras);
  }

  borrarImagen(uid:string): Observable<Object>{
    let data = '';
    return this.http.put(`${environment.base_url}/platos/imgdel/${uid}`, data, this.cabeceras);
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
