import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-navbar-admin',
  templateUrl: './navbar-admin.component.html',
  styleUrls: ['./navbar-admin.component.css']
})
export class NavbarAdminComponent implements OnInit {

  public nombreUsuario: string = '';

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.usuarioService.cargarUsuario( this.usuarioService.uid ).subscribe( (res: any) => {
      this.nombreUsuario = res.usuarios['nombre_usuario'];
    });
  }

  logout(): void {
    this.usuarioService.logout();
  }
}
