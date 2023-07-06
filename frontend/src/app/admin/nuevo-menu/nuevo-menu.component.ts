import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import listaElementos from 'src/assets/json/elementos.json';
import { MenuService } from '../../services/menu.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nuevo-menu',
  templateUrl: './nuevo-menu.component.html',
  styleUrls: ['./nuevo-menu.component.css']
})
export class NuevoMenuComponent implements OnInit {

  public menu: any = {
    lunes:{ desayuno:[], almuerzo:[], comida:[], merienda:[], cena:[] },
    martes:{ desayuno:[], almuerzo:[], comida:[], merienda:[], cena:[] },
    miercoles:{ desayuno:[], almuerzo:[], comida:[], merienda:[], cena:[] },
    jueves:{ desayuno:[], almuerzo:[], comida:[], merienda:[], cena:[] },
    viernes:{ desayuno:[], almuerzo:[], comida:[], merienda:[], cena:[] },
    sabado:{ desayuno:[], almuerzo:[], comida:[], merienda:[], cena:[] },
    domingo:{ desayuno:[], almuerzo:[], comida:[], merienda:[], cena:[] }
  }

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    nombre: ['', Validators.required],
    objetivo: ['', Validators.required],
    fecharec: new Array([]),
    menusem: this.menu
  });

  public posiblesFechas = [
    {id: 1, name: 'Invierno', value: 1, marcado: false},
    {id: 2, name: 'Primavera', value: 2, marcado: false},
    {id: 3, name: 'Verano', value: 3, marcado: false},
    {id: 4, name: 'Otoño', value: 4, marcado: false},
  ];

  elementos: any = listaElementos;

  public submited = false;
  public uid: string = '';

  constructor(private fb: FormBuilder,
              private menuService: MenuService,
              private router: Router) { }

  ngOnInit(): void {
  }

  crearMenu(){

    this.submited = true;

    //Actualizar variables
    var fechas = new Array();
    for(let i = 0; i < this.posiblesFechas.length; i++){
      if(this.posiblesFechas[i].marcado){
        fechas.push(this.posiblesFechas[i].value);
      }
    }
    this.datosForm.controls['fecharec'].setValue(fechas);
    //////////

    this.menuService.crearMenu(this.datosForm.value)
    .subscribe((res: any) => {
      this.datosForm.markAsPristine();
      this.uid = res['menu'].uid;
      this.router.navigate(['/admin/menus/editar-menu/', this.uid]);
    }, (err) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

  onCheckboxChange(e: any, uid: any){

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

}
