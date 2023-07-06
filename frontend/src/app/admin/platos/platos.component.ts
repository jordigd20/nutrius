import { Component, OnInit } from '@angular/core';
import { Plato } from 'src/app/models/plato.model';
import { PlatoService } from '../../services/plato.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../services/usuario.service';
import { MenuService } from '../../services/menu.service';
import { MenuPerfilService } from '../../services/menuperfil.service';
import { lastValueFrom } from 'rxjs';
import listaElementos from 'src/assets/json/elementos.json';

@Component({
  selector: 'app-platos',
  templateUrl: './platos.component.html',
  styleUrls: ['./platos.component.css']
})
export class PlatosComponent implements OnInit {
  //Control de paginacion
  public totalRegistros: number = 0;
  public posicionActual: number = 0;
  public registrosPorPagina: number = environment.registrosPorPagina;
  //Control del loading
  public loading = false;
  //Platos listado
  public listaPlatos: any[] = [];
  public listaCreadores: any = [];
  //Ultima busqueda
  public ultimaBusqueda= '';
  public intoleranciaIconoURL: string = '';
  public debounceTimer?: NodeJS.Timeout;
  elementos: any = listaElementos;

  constructor( private platoService: PlatoService,
               private usuarioService: UsuarioService,
               private menuService: MenuService,
               private menuPerfilService: MenuPerfilService) { }

  ngOnInit(): void {
    this.cargarPlatos(this.ultimaBusqueda);
    this.intoleranciaIconoURL = '../assets/img/intolerancias/';
  }

  cargarPlatos( texto: string){
    if(this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.loading = true;
      this.ultimaBusqueda = texto;
      this.platoService.cargarPlatos(this.posicionActual, '', '', texto)
      .subscribe( (res: any) => {
        if(res['platos'].length === 0){
          if(this.posicionActual > 0){
            this.posicionActual = this.posicionActual - this.registrosPorPagina;
            if(this.posicionActual < 0) this.posicionActual = 0;
            this.cargarPlatos(this.ultimaBusqueda);
          }else{
            this.listaPlatos = [];
            this.totalRegistros = 0;
          }
        }else{
          this.listaPlatos = res['platos'];
          this.totalRegistros = res['page'].total;
          for(let i = 0; i < this.listaPlatos.length; i++){
            this.listaPlatos[i].eliminando = false;

            if(this.listaPlatos[i].usuario_id){
              this.usuarioService.cargarUsuario(this.listaPlatos[i].usuario_id)
                .subscribe((res: any) => {
                  this.listaCreadores[this.listaPlatos[i].usuario_id] = res['usuarios'].email;
                }, (errr) => {
                  console.error(errr);
                  Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción de obtener usuario, vuelva a intentarlo',});
                    this.loading = false;
                });
            }
            else{
              this.listaCreadores[this.listaPlatos[i].usuario_id] = this.listaPlatos[i].usuario_id;
            }
          }
        }
        this.loading = false;
      }, (err) => {
        console.error(err);
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
          this.loading = false;
      });
    }, 350);
  }

  cambiarPagina( pagina: number){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionActual = ((pagina - 1) * this.registrosPorPagina >=0 ? (pagina - 1) * this.registrosPorPagina : 0);
    this.cargarPlatos(this.ultimaBusqueda);
  }

  async eliminarPlato(idPlato: string, nombre: string, usuario_id: string, posPlato: number){
    this.listaPlatos[posPlato].eliminando = true;
    const numMenusConPlato = await this.existenMenusConPlato(idPlato, usuario_id);

    if(numMenusConPlato > 0) {
      this.listaPlatos[posPlato].eliminando = false;
      Swal.fire({
        title: `No es posible eliminar ${nombre}`,
        text: `Este plato pertenece a ${numMenusConPlato} ${numMenusConPlato !== 1 ? 'menús' : 'menú'}, por tanto no es posible eliminarlo.`,
        icon: 'warning',
        confirmButtonText: 'Ok',
        allowOutsideClick: false
      });
      return;
    }

    this.listaPlatos[posPlato].eliminando = false;
    Swal.fire({
      title: 'Eliminar plato',
      text: `Al eliminar el plato ${nombre} se perderán todos los datos asociados, ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if(result.value){
        this.listaPlatos[posPlato].eliminando = true;
        this.platoService.eliminarPlato(idPlato)
        .subscribe( resp => {
          this.listaPlatos[posPlato].eliminando = false;
          this.cargarPlatos(this.ultimaBusqueda);
        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelta a intentarlo',});
        })
      }
    })
  }

  async existenMenusConPlato(idPlato: string, usuario_id: string) {
    let existePlatoEnMenu = [];
    let numMenusConPlato = 0;

    if(usuario_id == null) {
      const res: any = await lastValueFrom(this.menuService.cargarMenus(0, '', 0));

      for(let i = 0; i < res['menus'].length; i++) {
        existePlatoEnMenu.push(this.comprobarPlatoEnMenu(res['menus'][i], idPlato));
        if(existePlatoEnMenu[i]) numMenusConPlato++;
      }

      return numMenusConPlato;
    }

    const resUsuario: any = await lastValueFrom(this.usuarioService.cargarUsuario(usuario_id));

    for(let i = 0; i < resUsuario['usuarios']['perfiles'].length; i++) {
      const idPerfil = resUsuario['usuarios']['perfiles'][i]._id;
      const resMenu: any = await lastValueFrom(this.menuPerfilService.cargarMenusPerfil(idPerfil, true, 0));

      for(let j = 0; j < resMenu.listaMenuPerfil.length; j++) {
        existePlatoEnMenu.push(this.comprobarPlatoEnMenuPerfil(resMenu.listaMenuPerfil[j], idPlato));
        if(existePlatoEnMenu[j]) numMenusConPlato++;
      }
    }

    return numMenusConPlato;
  }

  comprobarPlatoEnMenuPerfil(menu: any, idPlato: string): boolean {
    let platoEnMenu = false;

    for(let i = 0; i < 7; i++) {
      for(let j = 0; j < 5; j++) {
        let dia = this.elementos[4].elementos[i].propiedad;
        let comida = this.elementos[2].elementos[j].propiedad;
        let numPlatos = menu.menusem[dia]["comidas"][comida]["platos"].length;

        for(let k = 0; k < numPlatos; k++) {
          if( menu.menusem[dia]["comidas"][comida]["platos"][k].plato.plato_id._id == idPlato ) {
            platoEnMenu = true;
          }
        }

      }
    }

    return platoEnMenu;
  }

  comprobarPlatoEnMenu(menu: any, idPlato: string): boolean {
    let platoEnMenu = false;

    for(let i = 0; i < 7; i++) {
      for(let j = 0; j < 5; j++) {
        let dia = this.elementos[4].elementos[i].propiedad;
        let comida = this.elementos[2].elementos[j].propiedad;
        let numPlatos = menu.menusem[dia][comida].length;

        for(let k = 0; k < numPlatos; k++) {
          if( menu.menusem[dia][comida][k].plato == idPlato ) {
            platoEnMenu = true;
          }
        }

      }
    }

    return platoEnMenu;
  }

}
