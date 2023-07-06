import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) {}

  enviarMensaje(mensaje: string) {

    const query = {
      sessionId: this.sessionId,
      queryInput: {
        text: {
            text: mensaje,
            languageCode: 'es',
        },
      },
    };

    return this.http.post(`${environment.base_url}/webhook/respuesta`, query, this.cabeceras);
  }

  async activarChat() {

    // Creamos una nueva sesion y se guarda en sessionStorage
    const sessionId = uuidv4();
    sessionStorage.setItem('sessionId', sessionId);

    const query = {
      sessionId,
      queryInput: {
        text: {
            text: 'autenticar_usuario_web',
            languageCode: 'es',
        },
      },
      parameters: {
        token: this.token
      }
    };

    return this.http.post(`${environment.base_url}/webhook/respuesta`, query, this.cabeceras);
  }

  get sessionId(): string {
    return sessionStorage.getItem('sessionId') || '';
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
