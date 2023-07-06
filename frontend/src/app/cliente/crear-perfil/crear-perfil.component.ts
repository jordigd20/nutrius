import { Component, OnInit } from '@angular/core';
import { PerfilService } from '../../services/perfil.service';
import { UsuarioService } from '../../services/usuario.service';
import { MenuPerfilService } from 'src/app/services/menuperfil.service';
import { Perfil } from '../../models/perfil.model';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ControlEventosService } from '../../services/control-eventos.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-crear-perfil',
  templateUrl: './crear-perfil.component.html',
  styleUrls: ['./crear-perfil.component.css']
})
export class CrearPerfilComponent implements OnInit {

  public nombrePerfil: string = '';
  public apellidosPerfil: string = '';
  public fechaPerfil: string = '';
  public sexoPerfil: string = '';
  public pesoPerfil: number = 0;
  public alturaPerfil: number = 0;
  public pesoObjetivoPerfil: number = 0;
  public fechaObjetivoPerfil: string = '';
  public objetivoPerfil: string = '';

  public avatarPerfil: string = 'avatar1.jpeg';
  public avatarPerfilMostrar: string = '../../../assets/img/avatar1.jpeg';

  public perfilForm = this.fb.group({
    usuario: [''],
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    fecha_nacimiento: ['', Validators.required],
    sexo: ['', Validators.required],
    peso_actual: [''],
    altura_actual: [''],
    peso_objetivo: ['', Validators.required],
    fecha_objetivo: [''],
    objetivo: ['', Validators.required],
    intolerancias: new Array([])
  });

  public seguimientoForm = this.fb.group({
    fecha: [''],
    peso: ['', Validators.required],
    altura: ['', Validators.required],
  });

  public menuPerfilForm = this.fb.group({
    objetivo: ['', Validators.required],
    fecha: ['', Validators.required]
  });

  public menuPerfilFormSiguiente = this.fb.group({
    objetivo: ['', Validators.required],
    fecha: ['', Validators.required]
  });

  public fechaIntolerancias: string = '';
  public fechaObjetivoIntolerancias: string = '';
  intoleranciaIconoURL = '';
  public intoleranciasDisponibles = [
    {id: 1, name: 'cacahuetes', img: 'cacahuetes.svg', marcado: false},
    {id: 2, name: 'crustaceos', img: 'crustaceos.svg', marcado: false},
    {id: 3, name: 'gluten', img: 'gluten.svg', marcado: false},
    {id: 4, name: 'huevos', img:'huevos.svg', marcado: false},
    {id: 5, name: 'lacteos', img: 'lacteos.svg', marcado: false},
    {id: 6, name: 'moluscos', img: 'moluscos.svg', marcado: false},
    {id: 7, name: 'pescado', img: 'pescado.svg', marcado: false}
  ];

  public idPerfil: string = '';
  public perfil!: Perfil;
  public uidUsu: string = this.usuarioService.uid;
  public submited: boolean = false;
  public waiting: boolean = false;
  public modalRef!: BsModalRef;

  public nombresPerfiles: string[] = [];

  constructor( private perfilService: PerfilService,
               private usuarioService: UsuarioService,
               private menuPerfilService: MenuPerfilService,
               private fb: FormBuilder,
               private controlEventosService: ControlEventosService,
               private router: Router,
  ) { }

  ngOnInit(): void {
    this.intoleranciaIconoURL = '../assets/img/intolerancias/';
    this.cargarPerfiles();
    this.cargarIntolerancias();
    this.controlEventosService.rutaPerfiles(this.router.url);
  }

  cargarPerfiles(){
    if(this.uidUsu !== 'err'){
      this.perfilService.cargarPerfiles(this.uidUsu).subscribe((res:any)=>{
        for(var i = 0; i < res['perfiles'].length; i++){
          this.nombresPerfiles.push(res['perfiles'][i].nombre);
        }
        if(res['perfiles'].length >= 4){
          this.router.navigateByUrl('/inicio');
        }
      }, (err) =>{
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
      });
    }
  }

  cargarIntolerancias(){
    if(this.idPerfil){
      this.perfilService.cargarPerfil(this.idPerfil).subscribe((res: any) => {
        for(let i = 0; i < res['existePerfil'].intolerancias.length; i++){
          for(let j = 0; j < this.intoleranciasDisponibles.length; j++){
            if(res['existePerfil'].intolerancias[i] === this.intoleranciasDisponibles[j].name){
              this.intoleranciasDisponibles[j].marcado = true;
            }
          }
        }

      }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
        return;
      });
    }
  }

  crearPerfil(){

    this.submited = true;

    if(this.perfilForm.get('objetivo').value === 'Dieta saludable'){
      this.perfilForm.controls['peso_objetivo'].setValue(-1);
    }

    if(!this.perfilForm.valid || !this.seguimientoForm.valid){
      return;
    }

    this.waiting = true;
    var alergias = new Array();
    for(let i = 0; i < this.intoleranciasDisponibles.length; i++){
      if(this.intoleranciasDisponibles[i].marcado){
        alergias.push(this.intoleranciasDisponibles[i].name);
      }
    }

    let fecha = new Date();
    this.perfilForm.controls['usuario'].setValue(this.uidUsu);
    this.seguimientoForm.controls['fecha'].setValue(fecha);
    this.perfilForm.controls['intolerancias'].setValue(alergias);
    this.perfilForm.controls['peso_actual'].setValue(this.seguimientoForm.value.peso);
    this.perfilForm.controls['altura_actual'].setValue(this.seguimientoForm.value.altura);

    if(this.perfilForm.valid){
      this.perfilService.crearPerfil(this.perfilForm.value).subscribe((resp:any)=>{
        this.perfilService.cargarPerfiles(this.uidUsu).subscribe(async (res:any) =>{
          const pid = res['perfiles'][res['perfiles'].length - 1].uid;

          this.menuPerfilForm.controls['objetivo'].setValue(this.perfilForm.controls['objetivo'].value);
          this.menuPerfilForm.controls['fecha'].setValue(new Date());

          const fechaSiguienteLunes = this.fechaSiguienteLunes();
          this.menuPerfilFormSiguiente.controls['objetivo'].setValue(this.perfilForm.controls['objetivo'].value);
          this.menuPerfilFormSiguiente.controls['fecha'].setValue(fechaSiguienteLunes);

          await Promise.all([
            firstValueFrom(this.perfilService.actualizarAvatar(pid, this.avatarPerfil)),
            firstValueFrom(this.menuPerfilService.crearMenuPerfil(pid, 'aleatorio', this.menuPerfilForm.value)),
            firstValueFrom(this.menuPerfilService.crearMenuPerfil(pid, 'aleatorio', this.menuPerfilFormSiguiente.value))
          ]).catch((err) => {
            Swal.fire({icon: 'error', title: 'Oops...', text: 'No se le pudo asignar un menú, vuelva a intentarlo más tarde'});
          });

          Swal.fire({icon: 'success', title: 'Hecho!', text: 'Perfil creado'}).then((result) => {
            if(result.value) this.router.navigateByUrl('/inicio');
          });

        }, (err) => {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo crear el Perfil3, vuelva a intentarlo',});
          this.waiting = false;
        });
      }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo crear el Perfil2, vuelva a intentarlo',});
        this.waiting = false;
      });
    }

  }

  onCheckboxChange(e:any, uid: any) {
    if (e.target.checked) {
      for(let i = 0; i < this.intoleranciasDisponibles.length; i++){
        if(this.intoleranciasDisponibles[i].id === uid){
          this.intoleranciasDisponibles[i].marcado = true;
        }
      }
    } else {
      for(let i = 0; i < this.intoleranciasDisponibles.length; i++){
        if(this.intoleranciasDisponibles[i].id === uid){
          this.intoleranciasDisponibles[i].marcado = false;
        }
      }
    }
  }

  convertirFecha2(datecita: Date): string{
    let year = datecita.getFullYear().toString();
    let month = datecita.getMonth()+1;
    let dt = datecita.getDate();
    let stringo= '', sdia='', smes='', syear='';

    if (dt < 10) {
      sdia = '0' + dt.toString();
    }else{
      sdia = dt.toString();
    }
    if (month < 10) {
      smes = '0' + month.toString();
    }else{
      smes = month.toString();
    }
    syear = year.toString();
    stringo = syear + '-' + smes + '-' + sdia;
    return stringo;
  }

  campoValido(campo: string, formulario: string) {
    if(formulario === 'perfil'){
      // comprobar que es mayor a 4 años
      if(campo === 'fecha_nacimiento'){
        if(this.perfilForm.get(campo).value != ''){
          var hoy = new Date();
          var f = new Date(this.perfilForm.get(campo)?.value);
          var edad = hoy.getFullYear() - f.getFullYear();
          var mes = hoy.getMonth() - f.getMonth();
          if(mes < 0 || (mes === 0 && hoy.getDate() < f.getDate())){
            edad--;
          }
          if(edad >= 4){
            return true;
          }
          else{
            return false;
          }
        }
      }
      else{
        // comprobar que el nombre no coincida con otro perfil
        var iguales = false;
        if(campo === 'nombre'){
          for(var i = 0; i < this.nombresPerfiles.length; i++){
            if(this.perfilForm.get(campo).value === this.nombresPerfiles[i]){
              iguales = true;
            }
          }
          if(iguales){
            return false;
          }
          else{
            return true;
          }
        }
        else{
          return this.perfilForm.get(campo)?.valid || !this.submited;
        }
      }
    }
    return this.seguimientoForm.get(campo)?.valid || !this.submited;
  }

  habilitarPesoObj(e: any){

    this.objetivoPerfil = this.perfilForm.get('objetivo').value;
    this.ngOnInit();

  }

  elegirAvatar(op: number){
    this.avatarPerfil = "avatar" + op + ".jpeg";
    this.avatarPerfilMostrar = "../../../assets/img/" + this.avatarPerfil;
  }

  fechaSiguienteLunes() {
    let fecha = new Date();
    let esLunes = false;

    if(fecha.getDay() == 1) {
      fecha.setDate(fecha.getDate() + 7);
      return fecha;
    }

    while (!esLunes) {
      if (fecha.getDay() == 1) {
          esLunes = true;
      } else {
          fecha = this.sumarDias(fecha);
      }
    }

    return fecha;
  }

  sumarDias (fecha: Date): Date {
    let res = new Date(fecha);
    res.setDate(res.getDate() + 1);
    return res;
  }
}
