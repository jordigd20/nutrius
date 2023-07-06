import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormBuilder } from '@angular/forms';
import { Menu } from 'src/app/models/menu.model';
import { MenuService } from '../../services/menu.service';
import listaElementos from 'src/assets/json/elementos.json';
import Swal from 'sweetalert2';
import { firstValueFrom, Subscription } from 'rxjs';
import { MenuPerfilService } from '../../services/menuperfil.service';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css']
})
export class MenusComponent implements OnInit {
  public loading: boolean = true;

  public totalMenus: number = 0;
  public posicionActual: number = 0;
  public registrosPorPagina: number = environment.registrosPorPagina;
  public listaMenus: any[] = [];
  public debounceTimer?: NodeJS.Timeout;

  public buscarForm = this.fb.group({
    texto: [''],
    objetivo: ['']
  });

  elementos: any = listaElementos;

  public subs$!: Subscription;

  constructor(private fb: FormBuilder,
              private menuService: MenuService,
              private menuPerfilService: MenuPerfilService) { }

  ngOnInit(): void {
    this.cargarMenus();
    this.subs$ = this.buscarForm.valueChanges
      .subscribe( event => {
        this.cargarMenus();
      });
  }

  borrar() {
    this.buscarForm.reset();
    this.buscarForm.get('objetivo')?.setValue("");
    this.cargarMenus();
  }

  cargarMenus() {
    if(this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.loading = true;
      const objetivo = this.buscarForm.get('objetivo')?.value || '';
      const texto = this.buscarForm.get('texto')?.value || '';

      this.menuService.listaMenus(this.posicionActual, texto, objetivo)
        .subscribe( (res: any) => {
          if (res['menus'].length === 0) {
            if (this.posicionActual > 0) {
              this.posicionActual = this.posicionActual - this.registrosPorPagina;
              if (this.posicionActual < 0) this.posicionActual = 0;
              this.cargarMenus();
            } else {
              this.listaMenus = [];
              this.totalMenus = 0;
            }
          } else {
            this.listaMenus = res['menus'];
            this.totalMenus = res['page'].total;

            for(let i = 0; i < this.listaMenus.length; i++) {
              this.listaMenus[i].eliminando = false;
            }

          }
          this.loading = false;

        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
          this.loading = false;
        });
    }, 350);
  }

  async borrarMenu( uid: string, nombre: string, posMenu: number) {
    this.listaMenus[posMenu].eliminando = true;
    const resm:any = await firstValueFrom(this.menuPerfilService.cargarMenuPerfil(uid, true));

    this.listaMenus[posMenu].eliminando = false;
    if(resm.listaMenuPerfil.length>0){
      Swal.fire({
        title: 'Eliminar menu',
        text: `No es posible eliminar el menu '${nombre}' ya que está en uso por perfiles`,
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Ok',
      });
    }
    else{
      Swal.fire({
        title: 'Eliminar menu',
        text: `Al eliminar al menu '${nombre}' se perderán todos los datos asociados. ¿Desea continuar?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Si, borrar',
        cancelButtonText: "Cancelar",
      }).then((result) => {
            if (result.value) {
              this.listaMenus[posMenu].eliminando = true;
              this.menuService.borrarMenu(uid)
                .subscribe( res => {
                  this.listaMenus[posMenu].eliminando = false;
                  this.cargarMenus();
                }
                ,(err) =>{
                  Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
                })
            }
        });
    }
  }

  cambiarPagina( pagina: number ){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionActual = ((pagina - 1) * this.registrosPorPagina >=0 ? (pagina - 1) * this.registrosPorPagina : 0);
    this.cargarMenus();
  }

}
