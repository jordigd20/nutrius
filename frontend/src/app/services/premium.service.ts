import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Premium } from '../models/premium.model';


@Injectable({
  providedIn: 'root'
})
export class PremiumService {

  constructor(private http: HttpClient) { }


  cargarPremium( desde: number, uid: string) { //id usu
    if (!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/premium/${uid}/?desde=${desde}`, this.cabeceras);
  }

  pagarPremium( uid: string, data: Premium): Observable<object> { //id usu
    if (!uid) { uid = '';}
    return this.http.post(`${environment.base_url}/premium/${uid}`, data, this.cabeceras);
  }

  actualizarPremium( uid: string, data: Premium): Observable<object> { //id plan premium
    if (!uid) { uid = '';}
    return this.http.put(`${environment.base_url}/premium/${uid}`, data, this.cabeceras);
  }

  cancelarPlanPremium(uid: string, subscripcion_id: string) { //id plan premium
    if (!uid) { uid = '';}
    if (!subscripcion_id) { subscripcion_id = '';}
    return this.http.post(`${environment.base_url}/premium/cancelar/${uid}`, {subscripcion_id}, this.cabeceras);
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
