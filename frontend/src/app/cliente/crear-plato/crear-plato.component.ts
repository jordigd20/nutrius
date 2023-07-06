import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { PlatoService } from '../../services/plato.service';
import { Plato } from '../../models/plato.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ControlEventosService } from '../../services/control-eventos.service';

@Component({
  selector: 'app-crear-plato',
  templateUrl: './crear-plato.component.html',
  styleUrls: ['./crear-plato.component.css']
})
export class CrearPlatoComponent implements OnInit {

  @Input('modalRef') modalRef: BsModalRef;

  public comidasDisponibles = [
    {id: 1, name: 'Desayuno', value: 'Desayuno', marcado: false},
    {id: 2, name: 'Almuerzo', value: 'Almuerzo', marcado: false},
    {id: 3, name: 'Comida', value: 'Comida', marcado: false},
    {id: 4, name: 'Merienda', value: 'Merienda', marcado: false},
    {id: 5, name: 'Cena', value: 'Cena', marcado: false}
  ];

  public intoleranciasDisponibles = [
    {id: 1, name: 'cacahuetes', img: 'cacahuetes.svg', marcado: false},
    {id: 2, name: 'crustaceos', img: 'crustaceos.svg', marcado: false},
    {id: 3, name: 'gluten', img: 'gluten.svg', marcado: false},
    {id: 4, name: 'huevos', img:'huevos.svg', marcado: false},
    {id: 5, name: 'lacteos', img: 'lacteos.svg', marcado: false},
    {id: 6, name: 'moluscos', img: 'moluscos.svg', marcado: false},
    {id: 7, name: 'pescado', img: 'pescado.svg', marcado: false}
  ];

  public datosForm: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    comida: [new Array([]), Validators.required],
    intolerancias: new Array([]),
    imagen: [''],
    archivo: [''],
    usuario_id: null
  });

  public idPlatoCreado: string = '';
  public idPerfil: string = '';
  public idMenuPerfil: string = '';
  public pos: number;
  public idPlatoURL: number;
  public idUsuario: string = this.usuarioService.uid;
  public submited = false;
  public ultimaBusqueda: string = '';
  public platosEncontrados: Plato[] = [];
  public mostrarPlatos: boolean = false;
  public comidaMarcada: boolean = false;

  intoleranciaIconoURL = '';
  public imagenPlatoURL: any;
  public imagePath: any;
  public filechanged = false;

  constructor(  private fb: FormBuilder,
                private platoService: PlatoService,
                private usuarioService: UsuarioService,
                private router: Router,
                private route: ActivatedRoute,
                private el: ElementRef,
                private controlEventosService: ControlEventosService,
              ) { }

  ngOnInit(): void {
    this.intoleranciaIconoURL = '../assets/img/intolerancias/';
    this.imagenPlatoURL = '../assets/img/platos/noimage.jpg';
    this.idPerfil = this.route.snapshot.params['pid'];
    this.idMenuPerfil = this.route.snapshot.params['idmp'];
    this.pos = this.route.snapshot.params['pos'];
    this.idPlatoURL = this.route.snapshot.params['idp'];
    this.datosForm.markAsPristine();
    this.controlEventosService.rutaPerfiles(this.router.url);
  }

  enviar() {

    this.submited = true;

    this.actualizarVariables();

    if(this.idUsuario)
      this.datosForm.controls['usuario_id'].setValue(this.idUsuario);

    this.platoService.crearPlato(this.datosForm.value)
    .subscribe( (res: any) => {
      this.datosForm.markAsPristine();
      this.idPlatoCreado = res['plato'].uid;
      if(this.filechanged==true){
        this.subirFoto();
      }

      Swal.fire({icon: 'success', title: 'Hecho!', text: 'Plato creado', allowOutsideClick: false, allowEscapeKey: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.modalRef.hide();
        }
      });
    }, (err) => {

      if (this.datosForm.controls['nombre'].invalid) {
          const inputNombre = this.el.nativeElement.querySelector(`[formcontrolname="nombre"]`);
          inputNombre.focus();
      }

      if (this.datosForm.controls['comida'].invalid) {

      }
    });
  }

  subirFoto(){
    const formData = new FormData();
    formData.append('archivo', this.datosForm.get('archivo')?.value);
    this.platoService.subirImagen(this.idPlatoCreado, formData)
    .subscribe((res: any) => {
      this.imagenPlatoURL = '../assets/img/platos/'+res['nombreArchivo'];
    }, (err) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

  actualizarVariables() {
    var comidas = new Array();
    for(let i = 0; i < this.comidasDisponibles.length; i++){
      if(this.comidasDisponibles[i].marcado){
        comidas.push(this.comidasDisponibles[i].value);
      }
    }
    this.datosForm.controls['comida'].setValue(comidas);
    var alergias = new Array();
    for(let i = 0; i < this.intoleranciasDisponibles.length; i++){
      if(this.intoleranciasDisponibles[i].marcado){
        alergias.push(this.intoleranciasDisponibles[i].name);
      }
    }
    this.datosForm.controls['intolerancias'].setValue(alergias);
  }

  buscarPlatosExistentes(texto: string) {
    this.ultimaBusqueda = texto;
    this.platoService.cargarPlatos(0, this.idUsuario, 'admin', this.ultimaBusqueda, '', '', 0)
      .subscribe((res: any) => {
        this.mostrarPlatos = true;
        if(this.ultimaBusqueda == '') {
          this.mostrarPlatos = false;
          this.platosEncontrados = [];
          this.submited = false;
        }
        this.platosEncontrados = res['platos'];
      }
    );
  }

  onCheckboxChange(e:any, uid: any, tipo: boolean) {
    if (e.target.checked) {
      if(!tipo){
        for(let i = 0; i < this.intoleranciasDisponibles.length; i++){
          if(this.intoleranciasDisponibles[i].id === uid){
            this.intoleranciasDisponibles[i].marcado = true;
          }
        }
      }else{
        for(let i = 0; i < this.comidasDisponibles.length; i++){
          if(this.comidasDisponibles[i].id === uid){
            this.comidasDisponibles[i].marcado = true;
          }
        }
      }
    } else {
      if(!tipo){
        for(let i = 0; i < this.intoleranciasDisponibles.length; i++){
          if(this.intoleranciasDisponibles[i].id === uid){
            this.intoleranciasDisponibles[i].marcado = false;
          }
        }
      }else{
        for(let i = 0; i < this.comidasDisponibles.length; i++){
          if(this.comidasDisponibles[i].id === uid){
            this.comidasDisponibles[i].marcado = false;
          }
        }
      }
    }

    let out = false;
    for(let i = 0; i < this.comidasDisponibles.length && !out; i++){
      if(this.comidasDisponibles[i].marcado){
        this.comidaMarcada = true;
        out = true;
        this.submited = false;
      }
      else{
        this.comidaMarcada = false;
      }
    }
  }

  onFileSelect(event: any){
    this.filechanged = true;

    const filesToUpload = event.target.files[0];
    this.datosForm.get('archivo')?.setValue(filesToUpload);

    var reader = new FileReader();
    this.imagePath = event.target.files;
    reader.readAsDataURL(filesToUpload);
    reader.onload = (_event) => {
      this.imagenPlatoURL = reader.result;
    }
  }

}
