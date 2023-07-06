import { Component, OnInit, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { MenuPerfilService } from '../../services/menuperfil.service';
import { IslaService } from 'src/app/services/isla.service';
import { Router } from '@angular/router';
import { EngineService } from '../../services/engine.service';
import { Modelo } from '../../interfaces/modelo-grafico.interface';
import { PerfilService } from '../../services/perfil.service';
import { animacionConfeti } from '../../motor-grafico/arbol-escena/Frames';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ControlEventosService } from '../../services/control-eventos.service';
import { map, Subscription, timer, lastValueFrom } from 'rxjs';
import { vec3 } from 'gl-matrix';

interface isla {
  id: number,
  activa: boolean,
  titulo: string,
  lunes: dia,
  martes: dia,
  miercoles: dia,
  jueves: dia,
  viernes: dia,
  sabado: dia,
  domingo: dia
}

interface dia {
  enlace: string,
  activo: boolean
}

@Component({
  selector: 'app-kid',
  templateUrl: './kid.component.html',
  styleUrls: ['./kid.component.css']
})
export class KidComponent implements OnInit {

  @ViewChild('comidas')
  public comidas!: TemplateRef<any>;

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  listaMeses = [
    { id: 0, name: "Enero" },
    { id: 1, name: "Febrero" },
    { id: 2, name: "Marzo" },
    { id: 3, name: "Abril" },
    { id: 4, name: "Mayo" },
    { id: 5, name: "Junio" },
    { id: 6, name: "Julio" },
    { id: 7, name: "Agosto" },
    { id: 8, name: "Septiembre" },
    { id: 9, name: "Octubre" },
    { id: 10, name: "Noviembre" },
    { id: 11, name: "Diciembre" }
  ];
  idPerfil: string = '';
  islas: isla[] = [];
  islaActual: isla;
  public listaIslas: any[] = [];
  public listaModelos: any[] = [];
  public listaMenusPerfil: any[] = [];
  public mesActual: string;
  public semanaActual: number;
  public seleccionado = [
    {id: -1, name: "null"}
  ];
  public totalSemanas: number = 0;
  public years: number[] = [];

  public semanas: number[] = [];
  public posInicialIsla: number = -10;
  public limitePosMenor: number = -10;
  public limitePosMayor: number = 10;
  public ultimaPosIslaDesbloqueada: number = 0;

  public avatar: any;
  public enPerspectiva: boolean = true;
  public rutaLupa: string = '../../../assets/img/zoom-out.svg';
  public modalRef!: BsModalRef;
  public subs: Subscription;

  public cieloImagen: string = 'linear-gradient(#66ebff, #a2f2ff, #b3f5ff, #ccf8ff)';
  public backrep: string = "no-repeat";
  timerSubscription: Subscription;

  public loading = true;
  public porcentaje = '';

  constructor(private router: Router,
              private menuPerfil: MenuPerfilService,
              private islaService: IslaService,
              private perfilService: PerfilService,
              private engineService: EngineService,
              private modalService: BsModalService,
              private controlEventosService: ControlEventosService) { }

  async ngOnInit(): Promise<void> {

    localStorage.setItem('recursos', 'false');
    localStorage.setItem('porcentaje','0');

    this.subs = this.controlEventosService.eventEmitterFunction
    .subscribe((res: any) => {
      if(JSON.parse(res)['mostrar']){
        this.mostrarComidasDia();
      }
    }, (err) => {
      console.error(err);
    });

    this.timerSubscription = timer(0, 100).pipe(
      map(() => {
        this.cieloFondo();
        this.cerrarLoader();
      })
    ).subscribe();

    this.idPerfil = this.router.url.split("/")[2];
    await this.cargarPerfil();
    await this.calcularFechaActual();
    await this.calcularSemanas();
    await this.cargarIsla();
    await this.semanasTotales();
    await this.cargarIslas();
  }

  cerrarLoader(){
    this.porcentaje = localStorage.getItem('porcentaje');
    if(localStorage.getItem('recursos')=='true' && this.loading){
      this.loading=false;
    }
  }

  async cargarPerfil(){
    this.perfilService.cargarPerfil(this.idPerfil)
    .subscribe( ( res: any) => {
      let foto = res['existePerfil'].avatar;
      foto = foto.split("/");
      foto = foto[foto.length - 1];
      if(foto == "avatar1.jpeg"){
        this.avatar = 1;
      }
      else if(foto == "avatar2.jpeg"){
        this.avatar = 2;
      }
      else if(foto == "avatar3.jpeg"){
        this.avatar = 3;
      }
    }, (err: any) => {
      console.error(err);
    });
  }

  async calcularSemanas(){
    this.totalSemanas = 0;
    let f = new Date();
    let year = f.getFullYear();
    let month = f.getMonth()+1;
    let fecha = year.toString() + "-" + month.toString() + "-";
    let diasMes = new Date(year, month, 0).getDate();
    let dia1 = new Date(fecha + "01").getDay();
    if(dia1 !== 1){
      this.totalSemanas += 1;
    }
    for(let i = 1; i <= diasMes; i++){
      let fecha2 = new Date(fecha + "0" + i.toString()).getDay();
      if(fecha2 === 1){
        this.totalSemanas++;
      }
    }
  }

  async semanasTotales(mes?: any){
    let month = mes;
    if(!mes){
      let fecha = new Date();
      month = fecha.getMonth();
    }
    let semanas: any[] = [];

    const res: any = await lastValueFrom(this.islaService.cargarSemanas(month));
    let hasta = res.result2;
    this.semanaActual = res.result3;
    if(res.result2 == 0){
      hasta = 52;
    }
    for(let i = res.result; i <= hasta; i++){
      semanas.push(i);
    }
    this.semanas = semanas;
  }

  async cargarDesbloqueada(idIsla: any, i: number, bool: boolean, pos: number){
    let modelos: any[] = [];
    let objetos: any[] = [];
    let bases: any[] = [];
    if(this.listaIslas[pos].isla.isla == idIsla){
      objetos = this.listaIslas[pos].isla.objetos;
    }

    const isla: any = await lastValueFrom(this.islaService.cargarIslas(idIsla));

    let obj = {
      nombre: String,
      traslacion: [Number],
      escalado: [Number],
      rotacion: [Number],
      zoom: Number,
      tipo: String,
      pintar: Boolean,
      frame: Number,
      listaActual: Boolean
    };
    obj.nombre = isla['islas'][0].nombre;
    obj.rotacion = isla['islas'][0].rotacion;
    obj.traslacion = isla['islas'][0].posicion;
    obj.escalado = isla['islas'][0].escalado;
    modelos.push(obj);
    for(let k = 0; k < isla['islas'][0].objetos.length; k++){
      modelos.push(isla['islas'][0].objetos[k]);
    }
    let max = 8;
    if(isla['islas'][0].bases && isla['islas'][0].bases.length > 0){
      for(let k = 0; k < isla['islas'][0].bases.length; k++){
        modelos.push(isla['islas'][0].bases[k]);
      }
      bases = isla['islas'][0].bases;
      max = max + 7;
    }

    let fecha = new Date();
    let day = fecha.getDay();
    let dia: any;
    switch(day){
      case 0: dia = "domingo"; break;
      case 1: dia = "lunes"; break;
      case 2: dia = "martes"; break;
      case 3: dia = "miercoles"; break;
      case 4: dia = "jueves"; break;
      case 5: dia = "viernes"; break;
      case 6: dia = "sabado"; break;
    }

    let avatares = [];
    switch(this.avatar){
      case 1: avatares = isla['islas'][0].avatares[0].modelos; break;
      case 2: avatares = isla['islas'][0].avatares[1].modelos; break;
      case 3: avatares = isla['islas'][0].avatares[2].modelos; break;
    }

    if(this.islaActual.id == idIsla && bool==true){
      for(let k = 0; k < avatares.length; k++){
        if(avatares[k].dia==dia)
          modelos.push(avatares[k]);
      }
      max += 1;
    }
    for(let k = 0; k < max; k++){
      if(i == 0){
        modelos[k].traslacion = [-10, 0, 0];
      }else if(i == 1){
        modelos[k].traslacion = [-5, 0, 0];
      }else if(i == 2){
        modelos[k].traslacion = [0, 0, 0];
      }else if(i == 3){
        modelos[k].traslacion = [5, 0, 0];
      }else if(i == 4){
        modelos[k].traslacion = [10, 0, 0];
      }else if(i == 5){
        modelos[k].traslacion = [15, 0, 0];
      }else if(i == 6){
        modelos[k].traslacion = [20, 0, 0];
      }
    }

    let name2: any;
    switch(this.avatar){
      case 1: name2 = "monstruo1"; break;
      case 2: name2 = "monstruo2"; break;
      case 3: name2 = "monstruo3"; break;
    }
    for(let i = 0; i < modelos.length; i++){
      let name = modelos[i].nombre.split("-");
      modelos[i].zoom = -9;
      modelos[i].tipo = 'isla';
      modelos[i].pintar = true;
      for(let j = 0; j < objetos.length; j++){
        if(modelos[i].dia == objetos[j].dia){
          if(objetos[j].desbloqueado == true){
            modelos[i].pintar = true;
          }else{
            modelos[i].pintar = false;
          }
        }
      }
      for(let j = 0; j < bases.length; j++){
        if(modelos[i].nombre == bases[j].nombre){
          modelos[i].pintar = true;
        }
      }
      if(name[0] == name2 && modelos[i].dia == dia){
        modelos[i].pintar = true;
      }
      modelos[i].frame = 0;
      if(bool){
        modelos[i].islaActual=true;
      }
      modelos[i].idMenu = this.listaIslas[pos].uid;
      this.listaModelos.push(modelos[i]);
    }

  }

  async cargarBloqueada(i: any){
    try {
      const bloq: any = await lastValueFrom(this.islaService.cargarBloqueada());

      const bloqueada = bloq['isla'];
      let islaBloqueada: Modelo = {
        nombre: bloqueada.nombre,
        rotacion: bloqueada.rotacion,
        escalado: bloqueada.escalado,
        traslacion: bloqueada.traslacion,
        zoom: -9,
        tipo: 'isla',
        pintar: true,
        frame: 0,
        islaActual: false
      }
      if(i == 0){
        islaBloqueada.traslacion = [-10, 0, 0];
      }else if(i == 1){
        islaBloqueada.traslacion = [-5, 0, 0];
      }else if(i == 2){
        islaBloqueada.traslacion = [0, 0, 0];
      }else if(i == 3){
        islaBloqueada.traslacion = [5, 0, 0];
      }else if(i == 4){
        islaBloqueada.traslacion = [10, 0, 0];
      }else if(i == 5){
        islaBloqueada.traslacion = [15, 0, 0];
      }else if(i == 6){
        islaBloqueada.traslacion = [20,0,0];
      }
      this.listaModelos.push(islaBloqueada);
    } catch (error) {
      console.error(error);
    }

  }

  async cargarIslas(){
    this.listaIslas = [];
    this.listaModelos = [];
    this.calcularSemanas();
    let month = "";
    const f = new Date();
    let mes = f.getMonth();
    this.semanas = [];
    mes = Number(mes);
    await this.semanasTotales(mes);
    switch(mes){
      case 0: month = "Enero"; break;
      case 1: month = "Febrero"; break;
      case 2: month = "Marzo"; break;
      case 3: month = "Abril"; break;
      case 4: month = "Mayo"; break;
      case 5: month = "Junio"; break;
      case 6: month = "Julio"; break;
      case 7: month = "Agosto"; break;
      case 8: month = "Septiembre"; break;
      case 9: month = "Octubre"; break;
      case 10: month = "Noviembre"; break;
      case 11: month = "Diciembre"; break;
    }

    //Todos los menus del perfil
    for(let i = 0; i < this.listaMenusPerfil.length; i++){
        let menuPerfil = this.listaMenusPerfil[i];
        this.listaIslas.push(menuPerfil);
    }

    //Los menus del mes actual
    //this.listaIslas --> Esto en vd son menus, no islas

    for(let i = 0; i < this.semanas.length; i++){
      let added = false;
      for(let j = 0; j < this.listaIslas.length - 1; j++){
        if(this.listaIslas[j].semana == this.semanas[i]){
          let bool = false;
          if(this.listaIslas[j].uid == localStorage.getItem('idmp')){
            bool = true;
          }
          await this.cargarDesbloqueada(this.listaIslas[j].isla.isla, i, bool, j);
          this.ultimaPosIslaDesbloqueada = i;
          added = true;
        }
      }
      if(!added){
        await this.cargarBloqueada(i);
      }
    }
    for(let j = 0; j < this.listaModelos.length; j++){
      this.listaModelos[j].zoom = -9;
      this.listaModelos[j].tipo = 'isla';
      // this.listaModelos[j].pintar = true;
      this.listaModelos[j].frame = 0;
    }

    this.posInicialIsla += this.ultimaPosIslaDesbloqueada * 5;

    const mar: Modelo = {
      nombre: 'mar',
      rotacion: [0,0,0],
      escalado: [1,1,1],
      traslacion: [0,0,0],
      zoom: -9,
      tipo: 'mar',
      pintar: true,
      frame: 0
    }
    this.listaModelos.push(mar);

    for(let i = 0; i < animacionConfeti.length; i++) {
      animacionConfeti[i].traslacion = [this.posInicialIsla, 0, 0];
      this.listaModelos.push(animacionConfeti[i]);
    }
    await this.engineService.createScene(this.rendererCanvas, 10, this.listaModelos);
    this.engineService.animate();

    this.zoomIsla(this.posInicialIsla);

  }

  getMonth(mes: Number){
    let respuesta = "";
    switch(mes){
      case 0: respuesta = "Enero"; break;
      case 1: respuesta = "Febrero"; break;
      case 2: respuesta = "Marzo"; break;
      case 3: respuesta = "Abril"; break;
      case 4: respuesta = "Mayo"; break;
      case 5: respuesta = "Junio"; break;
      case 6: respuesta = "Julio"; break;
      case 7: respuesta = "Agosto"; break;
      case 8: respuesta = "Septiembre"; break;
      case 9: respuesta = "Octubre"; break;
      case 10: respuesta = "Noviembre"; break;
      case 11: respuesta = "Diciembre"; break;
    }
    return respuesta;
  }

  async cargarIsla(){

    const res: any = await lastValueFrom(this.menuPerfil.cargarMenusPerfil(this.idPerfil));
    this.listaMenusPerfil = res['listaMenuPerfil'];
    this.listaMenusPerfil.sort((a: any, b: any) => a.semana - b.semana);

    const menuActual = this.listaMenusPerfil[this.listaMenusPerfil.length - 2];
    localStorage.setItem('idmp', menuActual.uid);
    let tituloIsla = "";
    const mes1 = this.getMonth(new Date(menuActual.menusem.lunes.fecha).getMonth());
    const mes2 = this.getMonth(new Date(menuActual.menusem.domingo.fecha).getMonth());

    const isla: any = await lastValueFrom(this.islaService.cargarIslas(menuActual.isla.isla));

    if(mes1 === mes2) {
      tituloIsla = isla['islas'][0].nombre + " " + `(${new Date(menuActual.menusem.lunes.fecha).getDate()} - ${new Date(menuActual.menusem.domingo.fecha).getDate()} de ${mes2})`;
    } else {
      tituloIsla = isla['islas'][0].nombre + " " + `(${new Date(menuActual.menusem.lunes.fecha).getDate()} de ${mes1} - ${new Date(menuActual.menusem.domingo.fecha).getDate()} de ${mes2})`;
    }

    this.islaActual = {
      id: menuActual.isla.isla,
      activa: true,
      titulo: tituloIsla,
      lunes: {
        enlace: `/perfil/${this.idPerfil}/lunes/${menuActual.uid}`, activo: false
      },
      martes: {
        enlace: `/perfil/${this.idPerfil}/martes/${menuActual.uid}`, activo: false
      },
      miercoles: {
        enlace: `/perfil/${this.idPerfil}/miercoles/${menuActual.uid}`, activo: false
      },
      jueves: {
        enlace: `/perfil/${this.idPerfil}/jueves/${menuActual.uid}`, activo: false
      },
      viernes: {
        enlace: `/perfil/${this.idPerfil}/viernes/${menuActual.uid}`, activo: false
      },
      sabado: {
        enlace: `/perfil/${this.idPerfil}/sabado/${menuActual.uid}`, activo: false
      },
      domingo: {
        enlace: `/perfil/${this.idPerfil}/domingo/${menuActual.uid}`, activo: false
      }
    }

    // Activar los botones del lunes hasta el dia que sea, todos los demas estaran desactivados
    const activarDias: string[] = this.getDiasAActivar();
    for(let i = 0; i < activarDias.length; i++) {
      if(activarDias[i] === 'lunes') this.islaActual.lunes.activo = true;
      if(activarDias[i] === 'martes') this.islaActual.martes.activo = true;
      if(activarDias[i] === 'miercoles') this.islaActual.miercoles.activo = true;
      if(activarDias[i] === 'jueves') this.islaActual.jueves.activo = true;
      if(activarDias[i] === 'viernes') this.islaActual.viernes.activo = true;
      if(activarDias[i] === 'sabado') this.islaActual.sabado.activo = true;
      if(activarDias[i] === 'domingo') this.islaActual.domingo.activo = true;
    }
  }

  getDiasAActivar(): string[] {
    const fechaActual = new Date();
    let dia = fechaActual.getDay() - 1;
    /*
            0         1         2           3          4          5          6
        ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

    */
    if (dia == -1) dia = 6;

    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const activarDias = [];

    // Se añaden los dias hasta X dia (si es domingo se añaden todos)
    for(let i = 0; i < 7; i++) {
      if(i === dia+1) break;
      activarDias.push(i);
    }

    const activarDiasString = [];

    for(let i = 0; i < activarDias.length; i++) {
      activarDiasString.push(dias[activarDias[i]]);
    }

    return activarDiasString;
  }

  async calcularFechaActual(){
    const fecha = new Date();
    this.seleccionado[0].id = fecha.getMonth();
    switch(fecha.getMonth()){
      case 0: this.seleccionado[0].name = "Enero"; break;
      case 1: this.seleccionado[0].name = "Febrero"; break;
      case 2: this.seleccionado[0].name = "Marzo"; break;
      case 3: this.seleccionado[0].name = "Abril"; break;
      case 4: this.seleccionado[0].name = "Mayo"; break;
      case 5: this.seleccionado[0].name = "Junio"; break;
      case 6: this.seleccionado[0].name = "Julio"; break;
      case 7: this.seleccionado[0].name = "Agosto"; break;
      case 8: this.seleccionado[0].name = "Septiembre"; break;
      case 9: this.seleccionado[0].name = "Octubre"; break;
      case 10: this.seleccionado[0].name = "Noviembre"; break;
      case 11: this.seleccionado[0].name = "Diciembre"; break;
    }
    for(let i = 0; i < 5; i++){
      this.years.push(fecha.getFullYear() - i);
    }
  }

  cambiarCamaraAParalela() {
    const traslacionLuz: vec3 = [0, 10, 0];
    this.engineService.trasladarLuz(traslacionLuz);
    this.engineService.cambiarCamaraAParalela();
    this.engineService.setLimitePosMenor(-15);
    this.engineService.setLimitePosMayor(10);
  }

  cambiarPerspectiva() {

    if(this.enPerspectiva) {
      this.cambiarCamaraAParalela();
      this.rutaLupa = '../../../assets/img/zoom-in.svg';
    } else {
      this.zoomIsla(this.posInicialIsla);
      this.rutaLupa = '../../../assets/img/zoom-out.svg';
    }

    this.enPerspectiva = !this.enPerspectiva;
  }

  zoomIsla(traslacionAIsla: number) {

    const traslacion: vec3 = [traslacionAIsla, 1.5, -6];
    const escalado: vec3 = [1, 1, 1];
    const rotacion: vec3 = [-26, 0, 0];

    this.engineService.zoomIsla(traslacion, escalado, rotacion);

    const traslacionLuz: vec3 = [traslacionAIsla, 10, 0];
    this.engineService.trasladarLuz(traslacionLuz);

    const limiteMenor = -5 * ((this.semanas.length - 1) - this.ultimaPosIslaDesbloqueada);
    const limiteMayor = 5 * this.ultimaPosIslaDesbloqueada;

    this.engineService.setLimitePosMayor(limiteMayor);
    this.engineService.setLimitePosMenor(limiteMenor);
  }

  islaAnterior() {
    const limiteMenor = -5 * ((this.semanas.length - 1) - this.ultimaPosIslaDesbloqueada);
    const limiteMayor = 5 * this.ultimaPosIslaDesbloqueada;
    this.engineService.trasladarEscena(5, limiteMayor, limiteMenor);
  }

  islaSiguiente() {
    const limiteMenor = -5 * ((this.semanas.length - 1) - this.ultimaPosIslaDesbloqueada);
    const limiteMayor = 5 * this.ultimaPosIslaDesbloqueada;
    this.engineService.trasladarEscena(-5, limiteMayor, limiteMenor);
  }

  mostrarComidasDia() {
    this.modalRef = this.modalService.show(this.comidas, {class: 'modal-xl modalComidasMargen modalComidasFondoEsp', keyboard: false, backdrop: 'static'});
  }

  cieloFondo(){
    let d = new Date();
    let hour = d.getHours();
    if(hour>=7 && hour<=18){ //dia
      this.cieloImagen = 'linear-gradient(#66ebff, #a2f2ff, #b3f5ff, #ccf8ff)';
    }
    else if(hour>=19 && hour<21){ //atardecer
      this.cieloImagen = 'linear-gradient(#e699ff, #ff9933, #ffe066, #ffe066, #ffe066, #fff0b3)';
    }
    else{ //noche
      this.cieloImagen = 'url('+'../../../assets/motor/texturas/estrellas.png'+'),linear-gradient(#191970, #2929bc, #6d6ddf, #ababed, #ababed, #ababed)';
      this.backrep= 'repeat, no-repeat';
    }
  }

  ngOnDestroy(): void{
    this.subs.unsubscribe();
  }
}
