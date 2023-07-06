import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { PlatoService } from '../../services/plato.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Menu} from '../../models/menu.model';
import { Plato} from '../../models/plato.model';
import listaElementos from 'src/assets/json/elementos.json';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
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
export class MenuComponent implements OnInit {

  elementos: any = listaElementos;

  Object = Object;

  public datosForm = this.fb.group({
    nombre: ['', Validators.required],
    objetivo: ['', Validators.required],
    fecharec: new Array([])
  });

  public posiblesFechas = [
    {id: 1, name: 'Invierno', value: 1, marcado: false},
    {id: 2, name: 'Primavera', value: 2, marcado: false},
    {id: 3, name: 'Verano', value: 3, marcado: false},
    {id: 4, name: 'Otoño', value: 4, marcado: false},
  ];

  public submited = false;
  public uidMenu: string = 'nuevo';
  public nombreMenu: string = '';
  public objetivoMenu: number = -1;
  public platosMenu: Plato[][] = [];
  public menuAct: Menu[] = [];
  public dataHoverPlatos: boolean[][] = [];

  public totalPlatos: number = 0;
  public numPlatos:   number = 0;

  public pos: string = '';
  public loading: boolean = true;

  constructor(private fb: FormBuilder,
              private menuService: MenuService,
              private platoService: PlatoService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.uidMenu = this.route.snapshot.params['uidm'];
    this.cargarMenu();
  }

  cargarMenu(){
    this.submited = false;
    if(this.uidMenu !== 'nuevo'){
      this.menuService.cargarMenu(this.uidMenu)
      .subscribe((res: any) => {
        if(!res['menus']){
          this.router.navigateByUrl('/admin/menus');
          return;
        }
        else{
          this.nombreMenu = res['menus'].nombre;
          this.objetivoMenu = res['menus'].objetivo;
          this.menuAct[0] = res['menus'];

          for(let i = 0; i < res['menus'].fecharec.length; i++){
            for(let j = 0; j < this.posiblesFechas.length; j++){
              if(res['menus'].fecharec[i] === this.posiblesFechas[j].id){
                this.posiblesFechas[j].marcado = true;
              }
            }
          }

          let contador = 0;
          for(let i=0; i<7; i++){
            for(let j=0; j<5; j++){
              let dia = this.elementos[4].elementos[i].propiedad;
              let comida = this.elementos[2].elementos[j].propiedad;
              let numo = res['menus'].menusem[dia][comida].length;

              for(let x=0; x<numo; x++){
                this.platosMenu[contador] = [];
                this.dataHoverPlatos[contador] = [];
                this.cargarPlato(contador,x,res['menus'].menusem[dia][comida][x].plato);
                this.totalPlatos++;
              }
              contador++;
            }
          }

          if(this.totalPlatos === 0) {
            this.loading = false;
          }
        }
      });
    }
  }

  cargarPlato(i:number,j:number,uid:string){

    this.platoService.cargarPlato(uid)
      .subscribe((res: any) => {
        this.platosMenu[i][j] = res['platos'];
        this.dataHoverPlatos[i][j] = false;
        this.numPlatos++;
        this.sumarPlatoCargado(this.numPlatos);
      });
  }

  sumarPlatoCargado(numPlatos: number){
    if(numPlatos == this.totalPlatos){
      this.loading = false;
    }
  }

  borrarPlato(pos_dia:number,pos_comida:number,pos_nplato:number){
    let dia = this.elementos[4].elementos[pos_dia].propiedad;
    let comida = this.elementos[2].elementos[pos_comida].propiedad;

    this.menuAct[0].menusem![dia][comida].splice(pos_nplato, 1);

    this.menuService.actualizarMenu(this.uidMenu, this.menuAct[0])
    .subscribe( (res: any) => {
      this.ngOnInit();
    }, (err) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });

}

guardarCambios(){
  this.submited = true;

  if(this.datosForm.get('nombre')?.value !== ''){
    this.menuAct[0].nombre = this.datosForm.get('nombre')?.value;
  }

  if(this.datosForm.get('objetivo')?.value !== ''){
    this.menuAct[0].objetivo = this.datosForm.get('objetivo')?.value;
  }

  var fechas = new Array();
  for(let i = 0; i < this.posiblesFechas.length; i++){
    if(this.posiblesFechas[i].marcado){
      fechas.push(this.posiblesFechas[i].id);
    }
  }

  this.datosForm.controls['fecharec'].setValue(fechas);
  this.menuAct[0].fecharec = this.datosForm.get('fecharec')?.value;

  this.menuService.actualizarMenu(this.uidMenu, this.menuAct[0])
    .subscribe( (res: any) => {
      Swal.fire({icon: 'success', title: 'Hecho!', text: 'Datos del Menú Actualizados'});
    }, (err) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo plssss';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });

}

onCheckboxChange(e:any, uid: any){
  if (e.target.checked) {
    for(let i = 0; i < this.posiblesFechas.length; i++){
      if(this.posiblesFechas[i].id === uid){
        this.posiblesFechas[i].marcado = true;
      }
    }
  }
  else{
    for(let i = 0; i < this.posiblesFechas.length; i++){
      if(this.posiblesFechas[i].id === uid){
        this.posiblesFechas[i].marcado = false;
      }
    }
  }
}

volver(){

  var volver = false;

  let diasConComida = [];
  for(let i=0; !volver && i<7; i++){
    for(let j=0; !volver && j<5; j++){
      let dia = this.elementos[4].elementos[i].propiedad;
      let comida = this.elementos[2].elementos[j].propiedad;
      let numo =this.menuAct[0].menusem![dia][comida].length;

      if(numo > 0){
        diasConComida.push(numo);
      }

    }
  }

  if(diasConComida.length >= 35){
    this.router.navigate(['/admin/menus/']);
  }
  else{
    const msgerror = 'Debe haber al menos un plato en cada comida de cada día';
    Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
  }
}

mostrarHoverPlato(i: number, j: number) {
  this.dataHoverPlatos[i][j] = true;
}

esconderHoverPlato(i: number, j: number) {
  this.dataHoverPlatos[i][j] = false;
}

}
