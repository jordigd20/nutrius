import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Recompensa } from '../models/recompensa.model';
import { Perfil } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class RecompensaService {

  private perfil!: Perfil;

  constructor(private http: HttpClient) { }

  cargarRecompensa( uid: string, desde: number) {
    if(!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/recompensas/?id=${uid}&desde=${desde}`, this.cabeceras);
  }

  cargarRecompensasCanjeadas( desde: number, uid: string, canjeada: string){
    return this.http.get(`${environment.base_url}/recompensas/${uid}/${canjeada}/?desde=${desde}`, this.cabeceras);
  }

  crearRecompensa( uid: string, data: Recompensa): Observable<object>{
    return this.http.post(`${environment.base_url}/recompensas/${uid}`, data, this.cabeceras);
  }

  actualizarRecompensa( uid: string, data: Recompensa): Observable<object>{
    return this.http.put(`${environment.base_url}/recompensas/${uid}/`, data, this.cabeceras);
  }

  borrarRecompensa(uid: String): Observable<object>{
    return this.http.delete(`${environment.base_url}/recompensas/${uid}`, this.cabeceras);
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
