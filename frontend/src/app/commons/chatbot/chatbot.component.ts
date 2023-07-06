import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { firstValueFrom } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { mensaje } from 'src/app/interfaces/respuesta-chatbot.interface';
@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
  animations: [
    trigger('popOverAnimation',
    [
      transition(':enter', [
          style({ opacity: 0 }),
          animate('150ms ease-out', style({ opacity: 1 }))
        ]),
      transition(':leave',[
          style({  opacity: 1 }),
          animate('150ms ease-in', style({ opacity: 0 }))
        ])
    ])
  ]
})
export class ChatbotComponent implements OnInit {

  @ViewChild('chatContainer') chatContainer: ElementRef<HTMLDivElement>;
  @ViewChild('input_mensaje') inputViewChild: ElementRef<HTMLInputElement>;
  @Input() inputMensaje: any;

  chatActivado: boolean = false;
  waiting: boolean = false;
  mostrarError: boolean = false;

  mensajes: mensaje[] = [];

  constructor(private chatService: ChatService, private changeDetector: ChangeDetectorRef, private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  cambiarChatActivado() {
    this.chatActivado = !this.chatActivado;
  }

  async enviarMensaje(mensaje: string) {

    if(!mensaje) return;
    if(this.mostrarError) return;

    this.inputMensaje = '';
    this.inputViewChild.nativeElement.focus();

    this.mensajes.push({respuesta: {text: mensaje}, enviadoPor: 'usuario'});
    this.waiting = true;
    this.changeDetector.detectChanges();
    this.scrollHaciaAbajo();

    const res: any = await firstValueFrom(this.chatService.enviarMensaje(mensaje));
    this.mensajes.push({respuesta: res.respuesta, enviadoPor: 'agente'});
    this.waiting = false;

    this.changeDetector.detectChanges();
    this.scrollHaciaAbajo();
  }

  async mostrarChat() {

    // Si se vuelve a pulsar el logo mientras esta abierto se cierra y ya
    if(this.chatActivado) {
      this.chatActivado = false;
      return;
    }

    // Si el usuario ha cerrado el chat y se ha guardado la conversacion
    // se cargan los mensajes de nuevo
    if(this.mensajes.length !== 0) {
      this.chatActivado = true;
      this.changeDetector.detectChanges();
      this.scrollHaciaAbajo();
      return;
    }

    this.chatActivado = true;
    this.changeDetector.detectChanges();
    this.waiting = true;
    this.scrollHaciaAbajo();

    const res: any = await firstValueFrom(await this.chatService.activarChat());

    if(!res.respuesta.text) {
      this.waiting = false;
      this.mostrarError = true;
      return;
    }

    this.mensajes.push({respuesta: res.respuesta, enviadoPor: 'agente'});
    this.waiting = false;

    this.scrollHaciaAbajo();
  }

  insertarCargando() {
    let nuevoMensaje = `
    <div class="msg msg-agente cargando-chat">
      <p class="mb-0">...</p>
    </div>`;

    this.chatContainer.nativeElement.insertAdjacentHTML('beforeend', nuevoMensaje);
  }

  scrollHaciaAbajo() {
    this.chatContainer.nativeElement.scroll({
      top: this.chatContainer.nativeElement.scrollHeight,
      behavior: 'smooth'
    });
  }
}
