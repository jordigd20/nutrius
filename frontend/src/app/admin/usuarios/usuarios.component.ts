import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  public loading: boolean = true;

  public totalUsuarios: number = 0;
  public posicionActual: number = 0;
  public registrosPorPagina: number = environment.registrosPorPagina;

  private ultimaBusqueda: string = '';
  public listaUsuarios: any[] = [];
  public debounceTimer?: NodeJS.Timeout;

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    this.cargarUsuarios(this.ultimaBusqueda);
  }

  cargarUsuarios( textoBuscar: string ) {
    if(this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.loading = true;
      this.ultimaBusqueda = textoBuscar;
      this.usuarioService.cargarUsuarios(this.posicionActual, textoBuscar)
        .subscribe( (res: any) => {
          // Se comprueba si estamos en una página vacía, si es así entonces retrocedemos una página
          if (res['usuarios'].length === 0) {
            if (this.posicionActual > 0) {
              this.posicionActual = this.posicionActual - this.registrosPorPagina;
              if (this.posicionActual < 0) this.posicionActual = 0;
              this.cargarUsuarios(this.ultimaBusqueda);
            } else {
              this.listaUsuarios = [];
              this.totalUsuarios = 0;
            }
          } else {
            this.listaUsuarios = res['usuarios'];
            this.totalUsuarios = res['page'].total;

            for(let i = 0; i < this.listaUsuarios.length; i++) {
              this.listaUsuarios[i].eliminando = false;
            }
          }
          this.loading = false;

        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
          this.loading = false;
        });
    }, 350);
  }

  borrarUsuario( uid: string, nombre: string, posUsuario: number) {
    Swal.fire({
      title: 'Eliminar usuario',
      text: `Al eliminar al usuario '${nombre}' se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Si, borrar',
      cancelButtonText: "Cancelar",
    }).then((result) => {
          if (result.value) {
            this.listaUsuarios[posUsuario].eliminando = true;
            this.usuarioService.borrarUsuario(uid)
            .subscribe( res => {
                this.listaUsuarios[posUsuario].eliminando = false;
                this.cargarUsuarios(this.ultimaBusqueda);
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo más tarde',});
              })
          }
      });
  }

  cambiarPagina( pagina: number ){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionActual = ((pagina - 1) * this.registrosPorPagina >=0 ? (pagina - 1) * this.registrosPorPagina : 0);
    this.cargarUsuarios(this.ultimaBusqueda);
  }

}


