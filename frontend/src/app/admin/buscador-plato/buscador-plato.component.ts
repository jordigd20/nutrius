import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormBuilder } from '@angular/forms';
import { Menu } from 'src/app/models/menu.model';
import { MenuService } from '../../services/menu.service';
import { Plato } from 'src/app/models/plato.model';
import { PlatoService } from '../../services/plato.service';
import listaElementos from 'src/assets/json/elementos.json';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { trigger, transition, style, animate, query } from '@angular/animations';


const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter',
      [style({ opacity: 0 }), animate('300ms ease-out', style({ opacity: 1 }))],
      { optional: true }
    )
  ])
]);

const popOverAnimation = trigger('popOverAnimation',
[
  transition(':enter', [
      style({ opacity: 0 }),
      animate('150ms ease-out', style({ opacity: 1 }))
    ]),
  transition(':leave',[
      style({  opacity: 1 }),
      animate('150ms ease-in', style({ opacity: 0 }))
    ])
]);
@Component({
  selector: 'app-buscador-plato',
  templateUrl: './buscador-plato.component.html',
  styleUrls: ['./buscador-plato.component.css'],
  animations: [popOverAnimation, listAnimation],
})
export class BuscadorPlatoComponent implements OnInit {

  public loading: boolean = true;

  public totalPlatos: number = 0;
  public posicionActual: number = 0;
  public registrosPorPagina: number = environment.registrosPorPagina;

  public uidPlato: string = 'nuevo';

  public prueba: string = 'nuevo';

  public listaPlatos: Plato[] = [];

  public exPlatoNombre: string = '';
  public exPlatoImagen: string = '';
  public exPlatoIntolerancias: string[] = [];

  public newPlatoId: string = '';
  public newPlatoNombre: string = 'Nuevo plato';
  public newPlatoImagen: string = '';
  public newPlatoIntolerancias: string[] = [];

  public menuAct: Menu[] = [];
  public uidMenu: string = '';
  public pos: string = '';

  public buscarForm = this.fb.group({
    texto: [''],
    desayuno: [''],
    almuerzo: [''],
    comida: [''],
    merienda: [''],
    cena: [''],
    gluten: [''],
    crustaceos: [''],
    huevos: [''],
    pescado: [''],
    cacahuetes: [''],
    lacteos: [''],
    moluscos: ['']
  });

  elementos: any = listaElementos;
  public dataHoverPlatos: any[] = [];
  public debounceTimer?: NodeJS.Timeout;
  public subs$!: Subscription;

  constructor(private fb: FormBuilder,
              private platoService: PlatoService,
              private menuService: MenuService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.uidPlato = this.route.snapshot.params['uid'];
    this.uidMenu = this.route.snapshot.params['uidm'];
    this.pos = this.route.snapshot.params['pos'];
    if(this.uidPlato !== "0"){
      this.cargarPlato(this.uidPlato);
    }
    this.cargarPlatos();
    this.subs$ = this.buscarForm.valueChanges
      .subscribe( event => {
        if(event.texto !== '') {
          if(this.debounceTimer) clearTimeout(this.debounceTimer);

          this.debounceTimer = setTimeout(() => {
            this.cargarPlatos();
          }, 350);

        } else {
          this.cargarPlatos();
        }
      });
  }

  cargarPlatos() {
    this.loading = true;

    var comidas = "";
    let listaComidas = ['desayuno', 'almuerzo', 'comida', 'merienda', 'cena'];
    for(let i = 0; i < listaComidas.length; i++){
      if(this.buscarForm.get(listaComidas[i])?.value){
        comidas += listaComidas[i].charAt(0).toUpperCase() + listaComidas[i].slice(1) + ',';
      }
    }

    var intolerancias = "";
    let nombreIntolerancias = ['gluten', 'crustaceos', 'huevos', 'pescado', 'cacahuetes', 'lacteos', 'moluscos'];
    for(let i = 0; i < nombreIntolerancias.length; i++){
      if(this.buscarForm.get(nombreIntolerancias[i])?.value){
        intolerancias += nombreIntolerancias[i] + ',';
      }
    }

    const texto = this.buscarForm.get('texto')?.value || '';
    this.platoService.cargarPlatos(this.posicionActual, '', 'admin', texto, comidas, intolerancias)
      .subscribe( (resPlatos: any) => {
        if (resPlatos['platos'].length === 0) {
          if (this.posicionActual > 0) {
            this.posicionActual = this.posicionActual - this.registrosPorPagina;
            if (this.posicionActual < 0) this.posicionActual = 0;
            this.cargarPlatos();
          } else {
            this.listaPlatos = [];
            this.totalPlatos = 0;
          }
        } else {
          this.listaPlatos = resPlatos['platos'];
          this.totalPlatos = resPlatos['page'].total;

          for(let i = 0; i < resPlatos.platos.length; i++) {
            this.dataHoverPlatos[resPlatos.platos[i].uid] = false;
          }
        }
        this.loading = false;

      }, (err) => {
        console.error(err);
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
        this.loading = false;
      });
  }

cargarPlato(uid:string){
    this.platoService.cargarPlato(uid)
    .subscribe((res: any) => {
      this.exPlatoNombre = res['platos'].nombre;
      this.exPlatoIntolerancias = res['platos'].intolerancias;
      if(res['platos'].imagen){
        this.exPlatoImagen = res['platos'].imagen;
      }
    });
}

async cargarPlatoNew(uid: string){

  const resPlato: any = await firstValueFrom(this.platoService.cargarPlato(uid));
  this.newPlatoId = resPlato['platos'].uid;

}

  async guardarCambios(uid: string){

      await this.cargarPlatoNew(uid);
      this.menuService.cargarMenu(this.uidMenu).subscribe( (res: any) => {
        let pos_dia = this.pos[0];
        let pos_comida = this.pos[1];
        let pos_nplato = this.pos[2];

        let dia = this.elementos[4].elementos[pos_dia].propiedad;
        let comida = this.elementos[2].elementos[pos_comida].propiedad;
        this.menuAct[0] = res['menus'];

        if(this.newPlatoId!==''){
          if(this.uidPlato!=='0'){
            this.menuAct[0].menusem![dia][comida][pos_nplato].plato = this.newPlatoId;
          }
          else{
            this.menuAct[0].menusem![dia][comida].push({"plato":""+this.newPlatoId+""});
          }

          this.actualizarMenu(this.uidMenu, this.menuAct[0]);
        }

      }, (err) => {
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
  }

  actualizarMenu(uid:string, menu:Menu){
    this.menuService.actualizarMenu(uid, menu)
      .subscribe( (res: any) => {
        //redirigir a menu editado
        this.router.navigate(['/admin/menus/editar-menu', this.uidMenu]);
      }, (err) => {
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
  }

  cambiarPagina( pagina: number ){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionActual = ((pagina - 1) * this.registrosPorPagina >=0 ? (pagina - 1) * this.registrosPorPagina : 0);
    this.cargarPlatos();
  }

  volver(){
    this.router.navigate(['/admin/menus/editar-menu', this.uidMenu]);
  }

  resetComida(){
    document.querySelectorAll('[name=comidas]')
      .forEach((x: any) => {
        x.checked = false;
      });

    let comidas = ['desayuno', 'almuerzo', 'comida', 'merienda', 'cena'];
    for(let i = 0; i < comidas.length; i++){
      if(this.buscarForm.get(comidas[i])?.value){
        this.buscarForm.get(comidas[i])?.setValue(false);
      }
    }
  }
  mostrarHoverPlato(platoId: any) {
    this.dataHoverPlatos[platoId] = true;
  }

  esconderHoverPlato(platoId: any) {
    this.dataHoverPlatos[platoId] = false;
  }

  getHoverPlato(platoId: any) {
    return this.dataHoverPlatos[platoId];
  }
  resetIntolerancias(){
    document.querySelectorAll('[name=intolerancias]')
      .forEach((x: any) => {
        x.checked = false;
      });

    let nombreIntolerancias = ['gluten', 'crustaceos', 'huevos', 'pescado', 'cacahuetes', 'lacteos', 'moluscos'];
    for(let  i = 0; i < nombreIntolerancias.length; i++){
      if(this.buscarForm.get(nombreIntolerancias[i])?.value){
        this.buscarForm.get(nombreIntolerancias[i])?.setValue(false);
      }
    }
  }
}
