import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Data } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KidService {

  constructor(private http: HttpClient) { }

  comprobarPin( data: Data): Observable<object>{
    return this.http.post(`${environment.base_url}/kid/check_pinparental`, data, this.cabeceras);
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
