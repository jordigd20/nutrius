import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IslaService {

  constructor(private http: HttpClient) { }

  cargarIslas( id: string): Observable<object> {
    return this.http.get(`${environment.base_url}/islas/${id}`, this.cabeceras);
  }

  cargarBloqueada(): Observable<object>{
    return this.http.get(`${environment.base_url}/islas/`, this.cabeceras);
  }

  cargarSemanas(mes: number): Observable<object>{
    return this.http.get(`${environment.base_url}/islas/semanas/${mes}`, this.cabeceras);
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
