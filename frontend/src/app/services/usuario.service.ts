import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { loginForm } from '../interfaces/login-form.interface';
import { tap, map, catchError } from 'rxjs/operators';
import { Router, Data } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { registroForm } from '../interfaces/register-form.interface';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuario!: Usuario;

  constructor(private http: HttpClient,
              private router: Router) { }

  cargarUsuario( uid: string) {
    if (!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/usuarios?id=${uid}` , this.cabeceras);
  }
  cargarUsuario2( email: string){
    return this.http.get(`${environment.base_url}/usuarios?email=${email}`, this.cabeceras);
  }

  cargarUsuarios( desde: number, textoBusqueda?: string, registropp?: number ): Observable<object> {
    if (!desde) desde = 0;
    if (!textoBusqueda) textoBusqueda = '';
    if (registropp == null) registropp = environment.registrosPorPagina;
    return this.http.get(`${environment.base_url}/usuarios?desde=${desde}&texto=${textoBusqueda}&registropp=${registropp}`, this.cabeceras);
  }

  actualizarDatosPersonales(uid: string, data: Usuario): Observable<object>{
    return this.http.put(`${environment.base_url}/usuarios/${uid}`, data, this.cabeceras);
  }

  actualizarPsw(uid: string, data: Usuario): Observable<object>{
    return this.http.put(`${environment.base_url}/usuarios/np/${uid}`, data, this.cabeceras);
  }

  restablecerPassword(data: Data): Observable<object>{
    return this.http.put(`${environment.base_url}/usuarios/change/password`, data);
  }

  crearPinParental(uid: string, data: Usuario): Observable<object>{
    return this.http.put(`${environment.base_url}/usuarios/crearpin/${uid}`, data, this.cabeceras);
  }

  actualizarPinParental(uid: string, data: Usuario): Observable<object>{
    return this.http.put(`${environment.base_url}/usuarios/actpin/${uid}`, data, this.cabeceras);
  }

  borrarPinParental(uid: string): Observable<object>{
    return this.http.put(`${environment.base_url}/usuarios/borrpin/${uid}`, this.cabeceras);
  }

  borrarUsuario(uid: string): Observable<object> {
    return this.http.delete(`${environment.base_url}/usuarios/${uid}`, this.cabeceras);
  }

  registrarUsuario( formData: registroForm) {
    return this.http.post(`${environment.base_url}/usuarios`, formData);
  }

  activarUsuario( token: string){
    let body = "";
    return this.http.put(`${environment.base_url}/auth/activateUser/${token}`, body);
  }

  enviarEmail( formData: Data) {
    return this.http.post(`${environment.base_url}/auth/enviar/email`, formData, this.cabeceras);
  }
  reEnviarEmail( email: string) {
    let body = "";
    return this.http.post(`${environment.base_url}/auth/reenviar/${email}`, body);
  }

  registroGoogle( formData: Data){
    return this.http.post(`${environment.base_url}/auth/google2`, formData)
      .pipe(
        tap( (res: any) => {
          localStorage.setItem('token', res['token']);
          const uid = res['usuario'].uid;
          const rol = res ['usuario'].rol;
          this.usuario = new Usuario(uid, rol);
          localStorage.setItem('rol', rol);
        })
      );
  }

  login( formData: loginForm ) {
    return this.http.post(`${environment.base_url}/auth`, formData)
      .pipe(
        tap( (res: any) => {
          localStorage.setItem('token', res['token']);
          const {uid, rol} = res;
          this.usuario = new Usuario(uid, rol);
          localStorage.setItem('rol', rol);
        })
      );
  }

  loginGoogle( tokenGoogle: any ) {
    return this.http.post(`${environment.base_url}/auth/google`, {token: tokenGoogle})
      .pipe(
        tap( (res: any) => {
          localStorage.setItem('token', res['token']);
          const {uid, rol} = res;
          this.usuario = new Usuario(uid, rol);
          localStorage.setItem('rol', rol);
        })
      );
  }


  logout(): void {
    this.limpiarLocalStorage();
    this.router.navigateByUrl('/login');
  }

  validar(correcto: boolean, incorrecto: boolean): Observable<boolean> {

    if (this.token === '') {
      this.limpiarLocalStorage();
      return of(incorrecto);
    }

    return this.http.get(`${environment.base_url}/auth/token`, this.cabeceras)
      .pipe(
        tap( (res: any) => {
          // extaemos los datos que nos ha devuelto y los guardamos en el usurio y en localstorage
          const { uid, rol, token} = res;
          localStorage.setItem('token', token);
          this.usuario = new Usuario(uid, rol);
        }),
        map ( res => {
          return correcto;
        }),
        catchError ( err => {
          this.limpiarLocalStorage();
          return of(incorrecto);
        })
      );
  }

  validarToken(): Observable<boolean> {
    return this.validar(true, false);
  }

  validarNoToken(): Observable<boolean> {
    return this.validar(false, true);
  }

  limpiarLocalStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
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
    return this.usuario.uid;
  }

  get rol(): string {
    return this.usuario.rol;
  }

}
