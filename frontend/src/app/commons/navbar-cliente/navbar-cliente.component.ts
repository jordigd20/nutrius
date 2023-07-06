import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { ControlEventosService } from '../../services/control-eventos.service';

@Component({
  selector: 'app-navbar-cliente',
  templateUrl: './navbar-cliente.component.html',
  styleUrls: ['./navbar-cliente.component.css']
})
export class NavbarClienteComponent implements OnInit {

  public nombreUsuario: string = '';
  public pag_perfiles: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private controlEventosService: ControlEventosService) { }

  ngOnInit(): void {
    this.usuarioService.cargarUsuario( this.usuarioService.uid ).subscribe( (res: any) => {
      this.nombreUsuario = res.usuarios['nombre_usuario'];
    });

    this.controlEventosService.eventEmitterFunction.subscribe(
      (res: any) =>{
        if(res){
          const obj = JSON.parse(res);
          if(obj == '/inicio'){
            this.pag_perfiles = true;
          }
          else{
            this.pag_perfiles = false;
          }
        }
    })
  }

  logout(): void {
    this.usuarioService.logout();
  }

}
