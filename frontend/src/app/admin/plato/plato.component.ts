import { Component, OnInit, ElementRef } from '@angular/core';
import { PlatoService } from '../../services/plato.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Plato} from '../../models/plato.model';
@Component({
  selector: 'app-plato',
  templateUrl: './plato.component.html',
  styleUrls: ['./plato.component.css']
})
export class PlatoComponent implements OnInit {


  public datosForm: FormGroup = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    nombre: ['', Validators.required],
    comida: [new Array([]), Validators.required],
    intolerancias: new Array([]),
    imagen: [''],
    archivo: [''],
    usuario_id: null
  });

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

  public submited = false;
  public uid: string = 'nuevo';
  public titulo: string = 'Nuevo Plato';
  public ultimaBusqueda: string = '';
  public platosEncontrados: Plato[] = [];
  public mostrarPlatos: boolean = false;
  public comidaMarcada: boolean = false;


  public imagenPlatoURL: any;
  public imagePath: any;
  public filechanged = false;

  intoleranciaIconoURL = '';

  constructor( private fb: FormBuilder,
                private platoService: PlatoService,
                private route: ActivatedRoute,
                private router: Router,
                private el: ElementRef) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['uid'];
    this.datosForm.get('uid')?.setValue(this.uid);
    this.imagenPlatoURL = '../assets/img/platos/noimage.jpg';
    this.intoleranciaIconoURL = '../assets/img/intolerancias/';
    if(!this.uid){
      this.uid = 'nuevo';
      this.imagenPlatoURL = '../assets/img/platos/noimage.jpg';
    }
    this.cargarDatos();
  }

  cargarDatos(){
    this.submited = false;
    if(this.uid !== 'nuevo'){
      this.titulo = 'Editar Plato';
      this.platoService.cargarPlato(this.uid)
      .subscribe((res: any) => {
        if(!res['platos']){
          this.router.navigateByUrl('/admin/platos');
          return;
        };
        this.datosForm.get('nombre')?.setValue(res['platos'].nombre);
        //recogemos las comidas
        for(let i = 0; i < res['platos'].comida.length; i++){
          for(let j = 0; j < this.comidasDisponibles.length; j++){
            if(res['platos'].comida[i] === this.comidasDisponibles[j].name){
              this.comidasDisponibles[j].marcado = true;
            }
          }
        }
        //recogemos las intolerancias del plato
        for(let i = 0; i < res['platos'].intolerancias.length; i++){
          for(let j = 0; j < this.intoleranciasDisponibles.length; j++){
            if(res['platos'].intolerancias[i] === this.intoleranciasDisponibles[j].name){
              this.intoleranciasDisponibles[j].marcado = true;
            }
          }
        }
        if(res['platos'].imagen !== ''){
          this.imagenPlatoURL = '../assets/img/platos/' + res['platos'].imagen;
        }

        this.datosForm.get('imagen')?.setValue(res['platos'].imagen);
        this.datosForm.markAsPristine();

        this.uid = res['platos'].uid;
        this.submited = true;
      }, (err) => {
        this.router.navigateByUrl('/admin/platos');
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo'});
        return;
      });
    }else{
      this.nuevo();
    }
  }

  enviar() {

    this.submited = true;

    if(this.datosForm.get('uid')?.value === 'nuevo'){
      this.actualizarVariables();
      this.platoService.crearPlato(this.datosForm.value)
      .subscribe( (res: any) => {
        this.datosForm.markAsPristine();
        this.uid = res['plato'].uid;
        if(this.filechanged==true){
          this.subirFoto();
        }

        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Plato creado'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigateByUrl('/admin/platos');
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
    }else{
      this.actualizarVariables();
      this.platoService.actualizarPlato(this.datosForm.get('uid')?.value, this.datosForm.value)
      .subscribe( (res: any) => {
        this.datosForm.markAsPristine();
        if(this.filechanged==true){
          this.subirFoto();
        }
        Swal.fire({icon: 'success', title: 'Hecho!', text: 'Plato actualizado'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigateByUrl('/admin/platos');
          }
        });
      }, (err) => {
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
    }
  }

  buscarPlatosExistentes(texto: string) {
    this.ultimaBusqueda = texto;

    this.platoService.cargarPlatos(0, '', '', this.ultimaBusqueda, '', '', 0)
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



  nuevo() {
    this.uid = 'nuevo';
    this.titulo = 'Nuevo Plato';
    this.datosForm.reset();
    this.datosForm.get('uid')?.setValue('nuevo');
    this.datosForm.get('activo')?.setValue('true');
    this.submited = false;
    this.datosForm.markAsPristine();
  }

  cancelar() {
    if(this.uid === 'nuevo'){
      this.router.navigateByUrl('/admin/platos');
    }else{
      this.cargarDatos();
    }
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

  subirFoto(){
    const formData = new FormData();
    formData.append('archivo', this.datosForm.get('archivo')?.value);
    this.platoService.subirImagen(this.uid, formData)
    .subscribe((res: any) => {
      this.imagenPlatoURL = '../assets/img/platos/'+res['nombreArchivo'];
    }, (err) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

  borrarFoto(){
    this.platoService.borrarImagen(this.uid)
    .subscribe((res: any) => {
      this.imagenPlatoURL = '../assets/img/platos/noimage.jpg';
      this.datosForm.get('imagen')?.setValue("");
    }, (err) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

  campoNoValido( campo: string){
    return this.datosForm.get(campo)?.invalid && this.submited;
  }

  esnuevo(): boolean {
    if(this.datosForm.get('uid')?.value === 'nuevo'){
      return true;
    }
    return false;
  }




  get arrayComida() {
    return this.datosForm.controls["comida"] as FormArray;
  }

  get intolerancias() {
    return this.datosForm.controls["intolerancias"] as FormArray;
  }
}
