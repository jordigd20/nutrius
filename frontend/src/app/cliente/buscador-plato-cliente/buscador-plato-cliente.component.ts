import { Component, OnInit, TemplateRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlatoService } from '../../services/plato.service';
import listaElementos from 'src/assets/json/elementos.json';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlatoPerfilService } from '../../services/platoperfil.service';
import { MenuPerfilService } from '../../services/menuperfil.service';
import { MenuPerfil } from '../../models/menuperfil.model';
import { Plato } from '../../models/plato.model';
import { UsuarioService } from '../../services/usuario.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { PerfilService } from '../../services/perfil.service';
import { ControlEventosService } from '../../services/control-eventos.service';

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
  selector: 'app-buscador-plato-cliente',
  templateUrl: './buscador-plato-cliente.component.html',
  styleUrls: ['./buscador-plato-cliente.component.css'],
  animations: [popOverAnimation, listAnimation],
})
export class BuscadorPlatoClienteComponent implements OnInit {

  public loading: boolean = true;
  public waitingEliminarPlato: boolean = false;

  public totalPlatos: number = 0;
  public posicionActual: number = 0;
  public registrosPorPagina: number = environment.registrosPorPagina;

  public uidPlato: string = 'nuevo';

  public ultimaBusqueda: string = '';

  public exPlatoNombre: string = '';
  public exPlatoImagen: string = '';
  public exPlatoIntolerancias: string[] = [];

  public newPlatoId: string = '';
  public newPlatoNombre: string = 'Nuevo plato';
  public newPlatoImagen: string = '';
  public newPlatoIntolerancias: string[] = [];

  public fechaMenu: Date;
  public menuPerfilAct: MenuPerfil[] = [];
  public listaPlatos: Plato[] = [];
  public uidMenuPerfil: string = '';
  public idPerfil: string = '';
  public idUsuario: string = this.usuarioService.uid;
  public pos: string = '';

  public dataHoverPlatos: any[] = [];
  public debounceTimer?: NodeJS.Timeout;

  public modalRef!: BsModalRef;

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
    moluscos: [''],
    misPlatos: [''],
    platosNutri: ['']
  });

  public datosForm: FormGroup = this.fb.group({
    uid: ['', Validators.required],
    nombre: ['', Validators.required],
    comida: [new Array([]), Validators.required],
    intolerancias: new Array([]),
    imagen: [''],
    archivo: [''],
    usuario_id: this.idUsuario
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

  public platosEncontrados: Plato[] = [];
  public mostrarPlatos: boolean = false;
  public comidaMarcada: boolean = false;
  public submited = false;
  public imagenPlatoURL: any;
  public imagePath: any;
  public filechanged = false;
  intoleranciaIconoURL = '';
  public idPlatoUsuSelec = '';
  public platoUsuSelec: Plato;

  elementos: any = listaElementos;

  public subs$!: Subscription;

  constructor(private fb: FormBuilder,
              private platoService: PlatoService,
              private platoPerfilService: PlatoPerfilService,
              private menuPerfilService: MenuPerfilService,
              private usuarioService: UsuarioService,
              private perfilService: PerfilService,
              private route: ActivatedRoute,
              private router: Router,
              private modalService: BsModalService,
              private controlEventosService: ControlEventosService,
              ) { }

  ngOnInit(): void {
    this.idPerfil = this.route.snapshot.params['uid'];
    this.uidMenuPerfil = this.route.snapshot.params['idmp'];
    this.uidPlato = this.route.snapshot.params['pid'];
    this.pos = this.route.snapshot.params['pos'];
    this.intoleranciaIconoURL = '../assets/img/intolerancias/';

    if(sessionStorage.getItem('recomendarSeccion')) {
      const comidaRecomendada = sessionStorage.getItem('recomendarSeccion');
      this.buscarForm.controls[comidaRecomendada].setValue(comidaRecomendada);
      sessionStorage.removeItem('recomendarSeccion');
    }

    if(localStorage.getItem('fechaMenu')) {
      const fecha = localStorage.getItem('fechaMenu');
      this.fechaMenu = new Date(fecha);
    }

    // Autocompletar las intolerancias en el buscador
    this.perfilService.cargarPerfil(this.idPerfil).subscribe((perfil: any) => {
        if(perfil.existePerfil.intolerancias.length != 0) {
          const intolerancias = perfil.existePerfil.intolerancias;
          for(let i = 0; i < intolerancias.length; i++) {
            this.buscarForm.controls[intolerancias[i]].setValue(intolerancias[i]);
          }
        }
    });

    if(this.uidPlato !== "0") this.cargarPlato(this.uidPlato);

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

    this.controlEventosService.rutaPerfiles(this.router.url);
  }

  cargarPlatos() {
    this.loading = true;

    let platosAdmin = 'admin';
    let platosUsu = this.idUsuario;
    if(this.buscarForm.get('platosNutri')?.value){
      platosAdmin = 'admin';
      platosUsu = '';
    }
    if(this.buscarForm.get('misPlatos')?.value){
      platosUsu = this.idUsuario;
      platosAdmin = '';
    }
    if(this.buscarForm.get('misPlatos')?.value && this.buscarForm.get('platosNutri')?.value){
      platosAdmin = 'admin';
      platosUsu = this.idUsuario;
    }

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

    // Cargar platos normales
    this.platoService.cargarPlatos(this.posicionActual, platosUsu, platosAdmin, texto, comidas, intolerancias)
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
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
        this.loading = false;
      });
  }

  cargarPlato(uid:string){
      this.platoPerfilService.cargarPlatoPerfil(uid)
      .subscribe((res: any) => {
        if(res['platosPerfil']){
          this.exPlatoNombre = res['platosPerfil'].plato_id.nombre;
          this.exPlatoIntolerancias = res['platosPerfil'].plato_id.intolerancias;
          if(res['platosPerfil'].plato_id.imagen){
            this.exPlatoImagen = res['platosPerfil'].plato_id.imagen;
          }
        }
      }, (err) => {
        const msgerror = err.error.msg || 'No se pudo completar la acción de cargar PlatoPerfil, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
  }

  cambiarPlatoMenu(idPlatoNuevo: string){
    let pos_dia = this.pos[0];
    let pos_comida = this.pos[1];

    let dia = this.elementos[4].elementos[pos_dia].propiedad;
    let comida = this.elementos[2].elementos[pos_comida].propiedad;

    this.menuPerfilService.cambiarPlato(this.uidMenuPerfil, dia, comida, this.uidPlato, idPlatoNuevo, this.fechaMenu)
      .subscribe((res: any) => {

        sessionStorage.setItem('destacarPlato', JSON.stringify({
          plato_id: res.platoNuevo._id,
          dia,
          comida,
          pos_dia,
          pos_comida
        }));

        this.router.navigate(['/inicio/menus/'+this.idPerfil+'/editar-menu/', this.uidMenuPerfil]);
      }, (err) => {
        const msgerror = err.error.msg || 'No se pudo completar la acción de cambiar plato de menu perfil, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
  }

  cambiarPagina( pagina: number ){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionActual = ((pagina - 1) * this.registrosPorPagina >=0 ? (pagina - 1) * this.registrosPorPagina : 0);
    this.cargarPlatos();
  }

  resetColecciones(){
    document.querySelectorAll('[name=colecciones]')
      .forEach((x: any) => {
        x.checked = false;
      });

    let colecciones = ['misPlatos', 'platosNutri'];
    for(let i = 0; i < colecciones.length; i++){
      if(this.buscarForm.get(colecciones[i])?.value){
        this.buscarForm.get(colecciones[i])?.setValue(false);
      }
    }
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

  eliminarPlatoUsu(idPlato: string, nombrePlato: string){
    this.waitingEliminarPlato = true;
    this.idPlatoUsuSelec = idPlato;

    this.menuPerfilService.cargarMenusPerfil(this.idPerfil, true, 0).subscribe( (res: any) => {
      let existePlatoEnMenu = [];
      let numMenusConPlato = 0;

      for(let i = 0; i < res.listaMenuPerfil.length; i++) {
        existePlatoEnMenu.push(this.comprobarPlatoEnMenu(res.listaMenuPerfil[i]));
        if(existePlatoEnMenu[i]) numMenusConPlato++;
      }

      if(numMenusConPlato > 0) {
        this.waitingEliminarPlato = false;
        Swal.fire({
          title: `No es posible eliminar ${nombrePlato}`,
          text: `Este plato pertenece a ${numMenusConPlato} ${numMenusConPlato !== 1 ? 'menús' : 'menú'}, por tanto no es posible eliminarlo.`,
          icon: 'warning',
          confirmButtonText: 'Ok',
          allowOutsideClick: false
        });
        return;
      }

      this.waitingEliminarPlato = false;
      Swal.fire({
        title: 'Eliminar plato',
        text: `Al eliminar el plato ${nombrePlato} se perderán todos los datos asociados, ¿Desea continuar?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: "Cancelar",
      }).then((result) => {

        this.waitingEliminarPlato = false;
        if(result.value) {
          this.platoService.eliminarPlato(idPlato).subscribe( resp => {
            this.cargarPlatos();
          }, (err) => {
            Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelta a intentarlo',});
          })
        }

      });

    });
  }

  comprobarPlatoEnMenu(menu: any): boolean {
    let platoEnMenu = false;

    for(let i = 0; i < 7; i++) {
      for(let j = 0; j < 5; j++) {
        let dia = this.elementos[4].elementos[i].propiedad;
        let comida = this.elementos[2].elementos[j].propiedad;
        let numPlatos = menu.menusem[dia]["comidas"][comida]["platos"].length;

        for(let k = 0; k < numPlatos; k++) {
          if( menu.menusem[dia]["comidas"][comida]["platos"][k].plato.plato_id._id == this.idPlatoUsuSelec ) {
            platoEnMenu = true;
          }
        }

      }
    }

    return platoEnMenu;
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

  abrirCrearPlatoModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-xl'});
  }

  //Editar plato usuario

  editarPlatoUsu(template: TemplateRef<any>, plato: Plato){
    this.idPlatoUsuSelec = plato.uid;
    this.datosForm.controls['nombre'].setValue(plato.nombre);
    this.datosForm.controls['uid'].setValue(plato.uid);

    //recogemos las comidas
    for(let i = 0; i < plato.comida.length; i++){
      for(let j = 0; j < this.comidasDisponibles.length; j++){
        if(plato.comida[i] === this.comidasDisponibles[j].name){
          this.comidasDisponibles[j].marcado = true;
        }
      }
    }
    //recogemos las intolerancias del plato
    for(let i = 0; i < plato.intolerancias.length; i++){
      for(let j = 0; j < this.intoleranciasDisponibles.length; j++){
        if(plato.intolerancias[i] === this.intoleranciasDisponibles[j].name){
          this.intoleranciasDisponibles[j].marcado = true;
        }
      }
    }

    if(plato.imagen !== ''){
      this.imagenPlatoURL = '../assets/img/platos/' + plato.imagen;
    } else {
      this.imagenPlatoURL = '../assets/img/platos/noimage.jpg';
    }

    this.datosForm.get('imagen')?.setValue(plato.imagen);
    this.datosForm.markAsPristine();

    this.platoUsuSelec = plato;

    this.modalRef = this.modalService.show(template, { class: 'modal-xl'});

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

  borrarFoto(){
    this.platoService.borrarImagen(this.idPlatoUsuSelec)
    .subscribe((res: any) => {
      this.imagenPlatoURL = '../assets/img/platos/noimage.jpg';
      this.datosForm.get('imagen')?.setValue("");
    }, (err) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

  enviar() {
    this.submited = true;

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
          this.modalRef.hide();
        }
      });
    }, (err) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción de enviar formulario, vuelva a intentarlo';
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

  subirFoto(){
    const formData = new FormData();
    formData.append('archivo', this.datosForm.get('archivo')?.value);
    this.platoService.subirImagen(this.idPlatoUsuSelec, formData)
    .subscribe((res: any) => {
      this.imagenPlatoURL = '../assets/img/platos/'+res['nombreArchivo'];
    }, (err) => {
      console.error(err);
      const msgerror = err.error.msg || 'No se pudo completar la acción de subir foto, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
    });
  }

}
