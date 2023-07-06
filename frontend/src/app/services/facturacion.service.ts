import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Facturacion } from '../models/facturacion.model';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {

  constructor(private http: HttpClient){ }

  cargarFactura( idUsuario: string ): Observable<object> {
    return this.http.get(`${environment.base_url}/facturacion/${idUsuario}`, this.cabeceras);
  }

  actualizarFact(_id: string, data: Facturacion): Observable<object>{
    return this.http.put(`${environment.base_url}/facturacion/${_id}`, data, this.cabeceras);
  }

  crearFactura( idUsuario: string, data: Facturacion ): Observable<object> {
    return this.http.post(`${environment.base_url}/facturacion/${idUsuario}`, data, this.cabeceras);
  }

  cargarPaises() {
    return this.http.get('https://restcountries.com/v3.1/all?fields=translations').pipe(
      map((res: any) => res),
      mergeMap(p => p),
      map((res: any) => Object.assign({}, res.translations.spa).common),
    )
  }

  cargarProvincias() {
    return this.http.get('https://datos.gob.es/apidata/nti/territory/Province.json?_pageSize=50').pipe(
      map((res: any) => res.result.items),
      mergeMap(p => p),
      map((res: any) => res.label),
    );
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
