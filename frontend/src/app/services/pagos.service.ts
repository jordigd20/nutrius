import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  constructor(private http: HttpClient){ }

  crearPagoPaypal(plan: string): Observable<object> {
    return this.http.post(`${environment.base_url}/pagos/crear-pago-paypal`, {plan}, this.cabeceras);
  }

  validarPagoPaypal(token: string, PayerID: string): Observable<object> {
    return this.http.get(`${environment.base_url}/pagos/capturar-pago-paypal?token=${token}&PayerID=${PayerID}`, this.cabeceras);
  }

  getPagoPaypal(id: string): Observable<object> {
    return this.http.get(`${environment.base_url}/pagos/get-pago-paypal?id=${id}`, this.cabeceras);
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
