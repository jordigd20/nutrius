import { Component, OnInit } from '@angular/core';
import { PerfilService } from '../../services/perfil.service';
import { UsuarioService } from '../../services/usuario.service';
import { Perfil } from '../../models/perfil.model';
import { Seguimiento } from 'src/app/models/seguimiento.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ControlEventosService } from '../../services/control-eventos.service';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css']
})
export class EditarPerfilComponent implements OnInit {

  public uidPerfil: string = '';
  public nombrePerfil: string = '';
  public apellidosPerfil: string = '';
  public fechaPerfil: string = '';
  public sexoPerfil: string = '';
  public elotroSexo1: string = '';
  public objetivoPerfil: string = '';
  public elotroObjetivo1: string = '';
  public elotroObjetivo2: string = '';

  public avatarPerfil: string = '';

  public cambioObj: boolean = false;

  public datosPersonalesSubmited: boolean = false;
  public datosPersonalesWaiting: boolean = false;
  public personalesForm = this.fb.group({
    usuario: ['', Validators.required],
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    fecha_nacimiento: ['', Validators.required],
    sexo: ['', Validators.required],
    peso_actual: ['', Validators.required],
    altura_actual: ['', Validators.required],
    peso_objetivo: ['', Validators.required],
    fecha_objetivo: [''],
    objetivo: ['', Validators.required]
  });

  public pesoPerfil: number = 0;
  public alturaPerfil: number = 0;
  public pesoObjetivo: number = 0;
  public fechaObjetivo: string = '';
  public seguimientoForm = this.fb.group({
    fecha: ['', Validators.required],
    peso: ['', Validators.required],
    altura: ['', Validators.required],
  });

  public totalSeguimiento: number = 0;
  public listaSeguimiento: Seguimiento[] = [];

  public idPerfil: string = '';
  public perfil!: Perfil;
  public uidUsu: string = this.usuarioService.uid;
  public modalRef!: BsModalRef;

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
  public datosMenuSubmited: boolean = false;
  public datosMenuWaiting: boolean = false;
  public datosmenuForm: FormGroup = this.fb.group({
    usuario: ['', Validators.required],
    apellidos: ['', Validators.required],
    nombre: ['', Validators.required],
    fecha_nacimiento: ['', Validators.required],
    sexo: ['', Validators.required],
    peso_actual: ['', Validators.required],
    altura_actual: ['', Validators.required],
    peso_objetivo: ['', Validators.required],
    fecha_objetivo: [''],
    intolerancias: new Array([]),
    objetivo: ['', Validators.required]
  });

  public nombresPerfiles: string[] = [];
  public idsPerfiles: string[] = [];

  constructor( private perfilService: PerfilService,
               private usuarioService: UsuarioService,
               private route: ActivatedRoute,
               private router: Router,
               private fb: FormBuilder,
               private controlEventosService: ControlEventosService,
              ) { }

  ngOnInit(): void {
    this.idPerfil = this.route.snapshot.params['uid'];
    this.intoleranciaIconoURL = '../assets/img/intolerancias/';
    this.cargarPerfil();
    this.cargarIntolerancias();
    this.cargarNombresPerfiles();
    this.controlEventosService.rutaPerfiles(this.router.url);
  }

  cargarPerfil(){
    if(this.idPerfil !== 'err'){
      this.perfilService.cargarPerfil(this.idPerfil).subscribe((res: any) => {
        if(res['existePerfil']){
          this.uidPerfil = res['existePerfil'].uid;

          this.avatarPerfil = res['existePerfil'].avatar;

          this.nombrePerfil = res['existePerfil'].nombre;
          this.apellidosPerfil = res['existePerfil'].apellidos;
          let fecha = new Date(res['existePerfil'].fecha_nacimiento);
          this.fechaPerfil = this.convertirFecha2(fecha);
          this.sexoPerfil = res['existePerfil'].sexo;
          if(this.sexoPerfil == "NIÑA"){
            this.elotroSexo1 = "NIÑO";
          }
          else if(this.sexoPerfil == "NIÑO"){
            this.elotroSexo1 = "NIÑA";
          }
          this.pesoObjetivo = res['existePerfil'].peso_objetivo;

          if(res['existePerfil'].fecha_objetivo){
            let fecha2 = new Date(res['existePerfil'].fecha_objetivo);
            this.fechaObjetivo = this.convertirFecha2(fecha2);
          }
          else{
            this.fechaObjetivo = null;
          }

          this.objetivoPerfil = res['existePerfil'].objetivo;
          if(this.objetivoPerfil == "Bajar de peso"){
            this.elotroObjetivo1 = "Subir de peso";
            this.elotroObjetivo2 = "Dieta saludable";
          }
          else{
            if(this.objetivoPerfil == "Subir de peso"){
              this.elotroObjetivo1 = "Bajar de peso";
              this.elotroObjetivo2 = "Dieta saludable";
            }
            else{
              this.elotroObjetivo1 = "Bajar de peso";
              this.elotroObjetivo2 = "Subir de peso";
            }
          }

          this.personalesForm.controls['usuario'].setValue(this.uidUsu);
          this.personalesForm.controls['nombre'].setValue(this.nombrePerfil);
          this.personalesForm.controls['apellidos'].setValue(this.apellidosPerfil);
          this.personalesForm.controls['fecha_nacimiento'].setValue(this.fechaPerfil);
          this.personalesForm.controls['sexo'].setValue(this.sexoPerfil);
          this.personalesForm.controls['peso_objetivo'].setValue(this.pesoObjetivo);

          if(this.fechaObjetivo){
            this.personalesForm.controls['fecha_objetivo'].setValue(this.fechaObjetivo);
          }
          else{
            this.personalesForm.controls['fecha_objetivo'].setValue(null);
          }

          this.personalesForm.controls['objetivo'].setValue(this.objetivoPerfil);
          this.personalesForm.controls['peso_actual'].setValue(res['existePerfil'].peso_actual);
          this.personalesForm.controls['altura_actual'].setValue(res['existePerfil'].altura_actual);


          return;
        };
        }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
        return;
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


        let fecha = new Date(res['existePerfil'].fecha_nacimiento);
        this.fechaIntolerancias = this.convertirFecha2(fecha);

        if(res['existePerfil'].fecha_objetivo){
          let fecha2 = new Date(res['existePerfil'].fecha_objetivo);
          this.fechaObjetivoIntolerancias = this.convertirFecha2(fecha2);
        }
        else{
          this.fechaObjetivoIntolerancias = null;
        }

        this.datosmenuForm.controls['usuario'].setValue(this.uidUsu);
        this.datosmenuForm.controls['nombre'].setValue(res['existePerfil'].nombre);
        this.datosmenuForm.controls['apellidos'].setValue(res['existePerfil'].apellidos);
        this.datosmenuForm.controls['fecha_nacimiento'].setValue(this.fechaIntolerancias);
        this.datosmenuForm.controls['sexo'].setValue(res['existePerfil'].sexo);
        this.datosmenuForm.controls['peso_objetivo'].setValue(res['existePerfil'].peso_objetivo);
        this.datosmenuForm.controls['fecha_objetivo'].setValue(this.fechaObjetivoIntolerancias);
        this.datosmenuForm.controls['objetivo'].setValue(this.objetivoPerfil);
        this.datosmenuForm.controls['peso_actual'].setValue(res['existePerfil'].peso_actual);
        this.datosmenuForm.controls['altura_actual'].setValue(res['existePerfil'].altura_actual);

        this.datosmenuForm.markAsPristine();

      }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo más tarde'});
        return;
      });
    }
  }

  actualizarDatosPersonales(){
    this.datosPersonalesSubmited = true;

    if(!this.personalesForm.valid){
      return;
    }
    if(this.personalesForm.get('peso_objetivo').value < 0 && this.objetivoPerfil !== 'Dieta saludable'){
      return;
    }

    this.datosPersonalesWaiting = true;
    this.perfilService.cargarPerfil(this.idPerfil).subscribe((res: any) =>{

      this.perfilService.actualizarPerfil(res['existePerfil'].uid, this.personalesForm.value).subscribe((res: any) =>{
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Datos Personales Actualizados'});
        this.datosPersonalesWaiting = false;
        this.ngOnInit();
      }, (err) =>{
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo más tarde';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
        this.datosPersonalesWaiting = false;
      });


    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo más tarde'});
      this.datosPersonalesWaiting = false;
    });

  }

  actualizarDatosIntolerancias(){
    this.datosMenuSubmited = true;

    if(!this.datosmenuForm.valid){
      return;
    }

    this.datosMenuWaiting = true;
    var alergias = new Array();
    for(let i = 0; i < this.intoleranciasDisponibles.length; i++){
      if(this.intoleranciasDisponibles[i].marcado){
        alergias.push(this.intoleranciasDisponibles[i].name);
      }
    }

    if(this.cambioObj){
      this.datosmenuForm.get('peso_objetivo').setValue(-1);
      this.cambioObj = false;
    }

    if(!this.fechaObjetivoIntolerancias){
      this.datosmenuForm.get('fecha_objetivo').setValue(null);
    }

    this.datosmenuForm.controls['intolerancias'].setValue(alergias);

    this.perfilService.cargarPerfil(this.idPerfil).subscribe((res: any) =>{
      this.perfilService.actualizarPerfil(res['existePerfil'].uid, this.datosmenuForm.value).subscribe((res: any) =>{
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Datos para los menús Actualizados'});
        this.datosMenuWaiting = false;
        this.ngOnInit();
      }, (err) =>{
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo más tarde';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
        this.datosMenuWaiting = false;
      });
    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo más tarde'});
      this.datosMenuWaiting = false;
    });

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

  campoValido(campo: string) {
    // comprobar que es mayor a 4 años
    if(campo === 'fecha_nacimiento'){
      var hoy = new Date();
      var f = new Date(this.personalesForm.get(campo).value);
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
    else{
      // comprobar que el nombre no coincida con otro perfil
      var iguales = false;
      if(campo === 'nombre'){
        for(var i = 0; i < this.nombresPerfiles.length; i++){
          if(this.personalesForm.get(campo).value === this.nombresPerfiles[i]){
            if(this.idsPerfiles[i] != this.uidPerfil){
              iguales = true;
            }
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
        return this.personalesForm.get(campo)?.valid || !this.datosPersonalesSubmited;
      }
    }
  }

  comprobarPesoObj(){

    if(this.personalesForm.get('peso_objetivo').value < 0){
    return false;
    }
    else
    return true;
  }

  cambioObjetivo(e: any){
    this.cambioObj = true;
  }

  cargarNombresPerfiles(){
    if(this.uidUsu !== 'err'){
      this.perfilService.cargarPerfiles(this.uidUsu).subscribe((res:any)=>{
        for(var i = 0; i < res['perfiles'].length; i++){
          this.nombresPerfiles.push(res['perfiles'][i].nombre);
          this.idsPerfiles.push(res['perfiles'][i].uid);
        }
      }, (err) =>{
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
      });
    }
  }

  cambiarAvatar(op: number){
    this.perfilService.cargarPerfil(this.idPerfil).subscribe((res: any) =>{
      var img: string = '';
      img = "avatar" + op + ".jpeg";

      this.perfilService.actualizarAvatar(res['existePerfil'].uid, img).subscribe((res: any) =>{
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Avatar Actualizado'});
        this.ngOnInit();
      }, (err) =>{
        const msgerror = 'No se pudo completar la acción, vuelva a intentarlo más tarde';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });


    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo más tarde'});
    });

  }

}
