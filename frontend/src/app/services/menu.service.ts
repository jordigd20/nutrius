import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Menu } from '../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private menu!: Menu;

  constructor(private http: HttpClient) { }


  crearMenu( data: Menu): Observable<object>{
    return this.http.post(`${environment.base_url}/menus/`, data, this.cabeceras);
  }


  listaMenus(desde: number, texto?: string, objetivo?: string) {
    if (!texto) {
      texto = '';
    } else {
      texto = `&texto=${texto}`;
    }
    if (!objetivo) {
      objetivo = '';
    } else {
      objetivo = `&objetivo=${objetivo}`;
    }
    return this.http.get(`${environment.base_url}/menus?desde=${desde}${texto}${objetivo}` , this.cabeceras);
  }

  cargarMenus( desde: number, textoBusqueda?: string, registropp?: number ): Observable<object> {
    if (!desde) desde = 0;
    if (!textoBusqueda) textoBusqueda = '';
    if (registropp == null) registropp = environment.registrosPorPagina;
    return this.http.get(`${environment.base_url}/menus?desde=${desde}&texto=${textoBusqueda}&registropp=${registropp}`, this.cabeceras);
  }

  cargarMenu( uid: string ): Observable<object> {
    return this.http.get(`${environment.base_url}/menus?id=${uid}`, this.cabeceras);
  }

  actualizarMenu( uid: string, data: Menu): Observable<object>{
    return this.http.put(`${environment.base_url}/menus/${uid}`, data, this.cabeceras);
  }

  borrarMenu(uid: string): Observable<object> {
    return this.http.delete(`${environment.base_url}/menus/${uid}`, this.cabeceras);
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
    return this.menu.uid;
  }

}
