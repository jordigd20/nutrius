import { Component, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { itemSidebar } from '../../interfaces/item-sidebar.interface';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  public menuItems: itemSidebar[] = [
    { titulo: 'Inicio', url: '/admin/inicio', icono: 'fas fa-tv text-principal', activo: false },
    { titulo: 'Usuarios', url: '/admin/usuarios', icono: 'fas fa-users text-principal', activo: false,
        suburl: [
                  {url: '/admin/usuarios/perfiles/:uid'}
                ]
    },
    { titulo: 'Platos', url: '/admin/platos', icono: 'fas fa-apple-alt text-principal', activo: false,
      suburl: [
                {url: '/admin/platos/nuevo-plato'},
                {url: '/admin/platos/editar-plato'}
              ]
    },
    { titulo: 'Menus', url: '/admin/menus', icono: 'fas fa-utensils text-principal', activo: false,
      suburl: [
                {url: '/admin/menus/nuevo-menu'},
                {url: '/admin/menus/editar-menu/:uidm'},
                {url: '/admin/menus/editar-menu/:uidm/buscador-plato/:uid/pos/:pos'}
              ]
    },
  ];

  private subs$: Subscription;

  constructor(private router: Router) {
    this.subs$ = this.cargarEnlaceActivo()
                  .subscribe( (data: any) => {
                    for(let item of this.menuItems) {
                      item.activo = item.url === data.ruta ? true : false;
                      if(item.suburl && !item.activo) {
                        for(let i = 0; i < item.suburl.length; i++){
                          if(!item.activo && item.suburl[i].url === data.ruta){
                            item.activo = true;
                            break;
                          }
                        }

                      }
                    }
                });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subs$.unsubscribe();
  }

  cargarEnlaceActivo() {
    return this.router.events
    .pipe(
      filter( (event: any) => event instanceof ActivationEnd ),
      filter( (event: ActivationEnd) => event.snapshot.firstChild === null),
      map( (event: ActivationEnd) => event.snapshot.data)
    );
  }

}
