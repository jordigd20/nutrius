import { Component, OnInit, Input } from '@angular/core';
import { MenuPerfilService } from '../../services/menuperfil.service';
import { firstValueFrom } from 'rxjs';
import { PlatoPerfilService } from '../../services/platoperfil.service';
import { ControlEventosService } from '../../services/control-eventos.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { EngineService } from '../../services/engine.service';


interface comidas {
  desayuno: {
    completada: boolean,
    platos: any[],
    platosPerfil: any[],
    puntos: number
  },
  almuerzo: {
    completada: boolean,
    platos: any[],
    platosPerfil: any[],
    puntos: number
  },
  comida: {
    completada: boolean,
    platos: any[],
    platosPerfil: any[],
    puntos: number
  },
  merienda: {
    completada: boolean,
    platos: any[],
    platosPerfil: any[],
    puntos: number
  },
  cena: {
    completada: boolean,
    platos: any[],
    platosPerfil: any[],
    puntos: number
  },
  // Para poder acceder con la variable de seccionActual con []
  [key: string]: {
    completada: boolean,
    platos: any[],
    platosPerfil: any[],
    puntos: number
  }
}

@Component({
  selector: 'app-comidas',
  templateUrl: './comidas.component.html',
  styleUrls: ['./comidas.component.css']
})
export class ComidasComponent implements OnInit {

  @Input('modalRefComidas') modalRefComidas: BsModalRef;

  idmp: string = '';
  dia: string = '';
  idPerfil: string = '';
  diasArray: string[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  secciones: number[] = [0, 1, 2, 3, 4];
  seccionesString: string[] = ['desayuno', 'almuerzo', 'comida', 'merienda', 'cena'];
  seccionActual: any = {}; // numero, seccion
  comidasDia: comidas;
  fechaDia: Date;
  platosPerfil: any[] = [];
  menuPerfil: any = {};
  puntosComida: any = {
    desayuno: 0,
    almuerzo: 0,
    comida: 0,
    merienda: 0,
    cena: 0
  };
  actualizandoPlatos: boolean = false;
  botones: any = {
    desayuno: [], // idPlato, platoComido, platoGustado
    almuerzo:[],
    comida:[],
    merienda: [],
    cena: [],
  }

  nombreAnterior: string = '';
  nombreSiguiente: string = 'almuerzo';

  constructor(  private menuPerfilService: MenuPerfilService,
                private platoPerfilService: PlatoPerfilService,
                private controlEventosService: ControlEventosService,
                private engineService: EngineService) { }

  async ngOnInit(): Promise<void> {

    this.dia = localStorage.getItem('dia');
    this.idmp = localStorage.getItem('idmp');

    this.seccionActual = { numero: 0, seccion: 'desayuno' };

    await this.cargarSeccionMenu();

    this.controlEventosService.eventEmitterFunction.subscribe((res: any) => {});
  }

  cargarSeccionMenu() {
    return new Promise(async(resolve, reject) => {
      try {
        const res: any = await firstValueFrom(this.menuPerfilService.cargarMenuPerfil(this.idmp));
        this.menuPerfil = res.existeMenuPerfil;
        this.idPerfil = res.existeMenuPerfil.perfil_id;
        this.comidasDia = res.existeMenuPerfil.menusem[this.dia].comidas;
        this.fechaDia = new Date(res.existeMenuPerfil.menusem[this.dia].fecha);
        this.comidasDia.desayuno.platosPerfil = [];
        this.comidasDia.almuerzo.platosPerfil = [];
        this.comidasDia.comida.platosPerfil   = [];
        this.comidasDia.merienda.platosPerfil = [];
        this.comidasDia.cena.platosPerfil     = [];
        const dias = Object.entries(this.comidasDia);

        for(let i = 0; i < dias.length; i++) {
          const comidas: any = dias[i][1];
          const tipoComida: any = dias[i][0]; // desayuno, almuerzo, comida, merienda, cena
          this.puntosComida[dias[i][0]] = dias[i][1].puntos;

          for (let j = 0; j < comidas.platos.length; j++) {
            const ress: any = await firstValueFrom(this.platoPerfilService.cargarPlatoPerfil(comidas.platos[j].plato));

            this.platosPerfil.push(ress.platosPerfil);
            this.comidasDia[tipoComida].platosPerfil.push(ress.platosPerfil);

            this.botones[tipoComida].push({
              idPlato: ress.platosPerfil._id,
              platoComido: { botonSi: false, botonNo: false },
              platoGustado: { botonSi: false, botonNo: false },
            });

            // Recorrer info_platos para poner los botones en el estado actual
            for(let k = 0; k < ress.platosPerfil.info_plato.length; k++) {
              const fechaPlato = new Date(ress.platosPerfil.info_plato[k].fecha);

              if(fechaPlato.getDay() == this.diasArray.indexOf(this.dia) &&
                fechaPlato.getDate() == this.fechaDia.getDate() &&
                ress.platosPerfil.info_plato[k].comida == dias[i][0]) {

                if(ress.platosPerfil.info_plato[k].marcado) {

                  // Se recorren los botones para cambiar solo el del mismo id del plato
                  for(let l = 0; l < this.botones[tipoComida].length; l++) {
                    if(this.botones[tipoComida][l].idPlato == ress.platosPerfil._id) {

                      if(ress.platosPerfil.info_plato[k].completado) {
                        this.botones[tipoComida][l].platoComido.botonSi = true;
                        this.botones[tipoComida][l].platoComido.botonNo = false;

                        if(ress.platosPerfil.info_plato[k].gustado) {
                          this.botones[tipoComida][l].platoGustado.botonSi = true;
                          this.botones[tipoComida][l].platoGustado.botonNo = false;
                        } else {
                          this.botones[tipoComida][l].platoGustado.botonSi = false;
                          this.botones[tipoComida][l].platoGustado.botonNo = true;
                        }

                      } else {
                        this.botones[tipoComida][l].platoComido.botonSi = false;
                        this.botones[tipoComida][l].platoComido.botonNo = true;
                      }

                    }
                  }

                }
              }
            }
          }
        }

        resolve(true)
      } catch (error) {
        reject(error);
      }
    })
  }

  async actualizarPlatoMarcado(comido: boolean, idPlato: string) {
    this.actualizandoPlatos = true;
    const platosSeccion = this.comidasDia[this.seccionActual.seccion].platosPerfil;
    let posPlato = -1;
    for(let i = 0; i < platosSeccion.length; i++) {
      if(platosSeccion[i]._id == idPlato) {

        for(let j = 0; j < platosSeccion[i].info_plato.length; j++) {
          const fechaPlato = new Date(platosSeccion[i].info_plato[j].fecha);

          // Si coincide el dia y la comida
          if(fechaPlato.getDay() == this.diasArray.indexOf(this.dia) &&
             fechaPlato.getDate() == this.fechaDia.getDate() &&
             platosSeccion[i].info_plato[j].comida == this.seccionActual.seccion) {

            // Se recorren los botones para cambiar solo el del mismo id del plato
            for(let l = 0; l < this.botones[this.seccionActual.seccion].length; l++) {
              if(this.botones[this.seccionActual.seccion][l].idPlato == idPlato) {
                let posInfoPlato = -1;
                //Ha marcado que SI se ha comido el plato
                if(comido) {
                  this.botones[this.seccionActual.seccion][l].platoComido.botonSi = true;
                  this.botones[this.seccionActual.seccion][l].platoComido.botonNo = false;

                  if(!this.comidasDia[this.seccionActual.seccion].platosPerfil[i].info_plato[j].marcado ||
                    !this.comidasDia[this.seccionActual.seccion].platosPerfil[i].info_plato[j].completado){
                    this.sumarPuntuacion(this.puntosComida[this.seccionActual.seccion]);
                  }

                  const { posPlato: pPlato, posInfoPlato: pInfoPlato } = this.completarInfoPlato(idPlato, true, false);
                  posPlato = pPlato;
                  posInfoPlato = pInfoPlato;

                  this.comidasDia[this.seccionActual.seccion].platosPerfil[i].info_plato[j].completado = true;
                  this.comidasDia[this.seccionActual.seccion].platosPerfil[i].info_plato[j].fallado = false;

                }
                //Ha marcado que NO se ha comido el plato
                else {
                  this.botones[this.seccionActual.seccion][l].platoComido.botonNo = true;
                  this.botones[this.seccionActual.seccion][l].platoComido.botonSi = false;

                  if(this.comidasDia[this.seccionActual.seccion].platosPerfil[i].info_plato[j].marcado &&
                    this.comidasDia[this.seccionActual.seccion].platosPerfil[i].info_plato[j].completado){
                    this.sumarPuntuacion((this.puntosComida[this.seccionActual.seccion]) * (-1));
                  }

                  const { posPlato: pPlato, posInfoPlato: pInfoPlato } = this.completarInfoPlato(idPlato, false, true);
                  posPlato = pPlato;
                  posInfoPlato = pInfoPlato;

                  this.comidasDia[this.seccionActual.seccion].platosPerfil[i].info_plato[j].completado = false;
                  this.comidasDia[this.seccionActual.seccion].platosPerfil[i].info_plato[j].fallado = true;
                  this.comidasDia[this.seccionActual.seccion].platosPerfil[i].veces_fallado++;
                  this.platosPerfil[posPlato].info_plato[posInfoPlato].veces_fallado++;

                }

                this.platosPerfil[posPlato].info_plato[posInfoPlato].marcado = true;
                this.comidasDia[this.seccionActual.seccion].platosPerfil[i].info_plato[j].marcado = true;
                break;

              }
            }
          }
        }
      }
    }

    for(let i = 0; i < platosSeccion.length; i++) {
      if(platosSeccion[i]._id == idPlato && posPlato != -1) {
        const nuevoPlatoPerfil = { ...this.platosPerfil[posPlato]};
        nuevoPlatoPerfil.plato_id = this.comidasDia[this.seccionActual.seccion].platosPerfil[i].plato_id._id;
        await firstValueFrom(this.platoPerfilService.actualizarPlatoPerfil(idPlato, nuevoPlatoPerfil)).catch( (err) => {
          this.actualizandoPlatos = false;
          console.error(err);
        });
        break;
      }
    }

    await firstValueFrom(this.menuPerfilService.actualizarMenuPerfil(this.idmp, this.menuPerfil)).catch( (err) => {
      this.actualizandoPlatos = false;
      console.error(err);
    });
    this.actualizandoPlatos = false;
  }


  actualizarPlatoGustado(gustado: boolean, idPlato: string) {
    const platosSeccion = this.comidasDia[this.seccionActual.seccion].platosPerfil;
    let posPlato = -1;
    for(let i = 0; i < platosSeccion.length; i++) {
      if(platosSeccion[i]._id == idPlato) {

        for(let j = 0; j < platosSeccion[i].info_plato.length; j++) {
          const fechaPlato = new Date(platosSeccion[i].info_plato[j].fecha);

          // Si coincide el dia y la comida
          if(fechaPlato.getDay() == this.diasArray.indexOf(this.dia) &&
            fechaPlato.getDate() == this.fechaDia.getDate() &&
            platosSeccion[i].info_plato[j].comida == this.seccionActual.seccion) {

            // Se recorren los botones para cambiar solo el del mismo id del plato
            for(let l = 0; l < this.botones[this.seccionActual.seccion].length; l++) {
              if(this.botones[this.seccionActual.seccion][l].idPlato == idPlato) {

                if(gustado) {
                  posPlato = this.gustarInfoPlato(idPlato, true);

                  this.comidasDia[this.seccionActual.seccion].platosPerfil[i].info_plato[j].gustado = true;
                  this.comidasDia[this.seccionActual.seccion].platosPerfil[i].veces_gustado++;
                  this.botones[this.seccionActual.seccion][l].platoGustado.botonSi = true;
                  this.botones[this.seccionActual.seccion][l].platoGustado.botonNo = false;

                } else {
                  posPlato = this.gustarInfoPlato(idPlato, false);

                  this.comidasDia[this.seccionActual.seccion].platosPerfil[i].info_plato[j].gustado = false;
                  this.comidasDia[this.seccionActual.seccion].platosPerfil[i].veces_no_gustado++;
                  this.botones[this.seccionActual.seccion][l].platoGustado.botonNo = true;
                  this.botones[this.seccionActual.seccion][l].platoGustado.botonSi = false;
                }
                break;
              }
            }
          }
        }
      }
    }

    for(let i = 0; i < platosSeccion.length; i++) {
      if(platosSeccion[i]._id == idPlato && posPlato != -1) {
        const nuevoPlatoPerfil = { ...this.platosPerfil[posPlato]};
        nuevoPlatoPerfil.plato_id = this.comidasDia[this.seccionActual.seccion].platosPerfil[i].plato_id._id;
        this.platoPerfilService.actualizarPlatoPerfil(idPlato, nuevoPlatoPerfil).subscribe( (res: any) => {});
        break;
      }
    }
  }

  completarInfoPlato(idPlato: string, completado: boolean, fallado: boolean) {
    let posPlato = -1;
    let posInfoPlato = -1;
    let infoPlatoEncontrado = false;

    for(let i = 0; i < this.platosPerfil.length; i++) {
      if(infoPlatoEncontrado) break;
      if(this.platosPerfil[i]._id == idPlato) {
        for(let j = 0; j < this.platosPerfil[i].info_plato.length; j++) {
          const infoPlato = this.platosPerfil[i].info_plato[j];

          if(new Date(infoPlato.fecha).getDay() == this.diasArray.indexOf(this.dia) &&
            new Date(infoPlato.fecha).getDate() == this.fechaDia.getDate() &&
            infoPlato.comida == this.seccionActual.seccion) {
              this.platosPerfil[i].info_plato[j].completado = completado;
              this.platosPerfil[i].info_plato[j].fallado = fallado;
              infoPlatoEncontrado = true;
              posPlato = i;
              posInfoPlato = j;
              break;
          }
        }
      }
    }

    return { posPlato, posInfoPlato };
  }

  gustarInfoPlato(idPlato: string, gustado: boolean) {
    let posPlato = -1;
    let infoPlatoEncontrado = false;

    for(let i = 0; i < this.platosPerfil.length; i++) {
      if(infoPlatoEncontrado) break;
      if(this.platosPerfil[i]._id == idPlato) {
        for(let j = 0; j < this.platosPerfil[i].info_plato.length; j++) {
          const infoPlato = this.platosPerfil[i].info_plato[j];

          if(new Date(infoPlato.fecha).getDay() == this.diasArray.indexOf(this.dia) &&
            new Date(infoPlato.fecha).getDate() == this.fechaDia.getDate() &&
            infoPlato.comida == this.seccionActual.seccion) {
              this.platosPerfil[i].info_plato[j].gustado = gustado;

              if(gustado) this.platosPerfil[i].info_plato[j].veces_gustado++;
              else this.platosPerfil[i].info_plato[j].veces_no_gustado++;

              infoPlatoEncontrado = true;
              posPlato = i;
              break;
          }
        }
      }
    }

    return posPlato;
  }

  cambiarSeccion(seccion: string) {

    if(seccion == 'anterior') {
      this.seccionActual.numero--;
      this.seccionActual.seccion = this.seccionesString[this.seccionActual.numero];
      this.nombreAnterior = this.seccionesString[this.seccionActual.numero -1];
      this.nombreSiguiente = this.seccionesString[this.seccionActual.numero +1];
      return;
    }

    if(seccion == 'siguiente') {
      this.seccionActual.numero++;
      this.seccionActual.seccion = this.seccionesString[this.seccionActual.numero];
      this.nombreAnterior = this.seccionesString[this.seccionActual.numero -1];
      this.nombreSiguiente = this.seccionesString[this.seccionActual.numero +1];
      return;
    }

    this.seccionActual.seccion = seccion;
    this.seccionActual.numero = this.seccionesString.indexOf(seccion);
    this.nombreAnterior = this.seccionesString[this.seccionActual.numero -1];
    this.nombreSiguiente = this.seccionesString[this.seccionActual.numero +1];
  }


  getBotonCompletado(comido: boolean, idPlato: string): string {
    let res = '';
    for(let i = 0; i < this.botones[this.seccionActual.seccion].length; i++) {
      if(this.botones[this.seccionActual.seccion][i].idPlato == idPlato) {

        if(comido) {
          if(this.botones[this.seccionActual.seccion][i].platoComido.botonSi)
            res = 'completado';

        } else {
          if(this.botones[this.seccionActual.seccion][i].platoComido.botonNo)
            res = 'no-completado';

        }

      }
    }

    return res;
  }

  getBotonGustado(gustado: boolean, idPlato: string) {
    let res = '';
    for(let i = 0; i < this.botones[this.seccionActual.seccion].length; i++) {
      if(this.botones[this.seccionActual.seccion][i].idPlato == idPlato) {

        if(gustado) {
          if(this.botones[this.seccionActual.seccion][i].platoGustado.botonSi)
            res = 'gustado';

        } else {
          if(this.botones[this.seccionActual.seccion][i].platoGustado.botonNo)
            res = 'no-gustado';

        }

      }
    }

    return res;
  }

  sumarPuntuacion(pts:number){

    let seccionComida = true;
    let numNo = 0;
    for(let i = 0; i < this.botones[this.seccionActual.seccion].length; i++){
      if(this.botones[this.seccionActual.seccion][i].platoComido.botonNo) numNo++;

      if(this.botones[this.seccionActual.seccion].length > 1) {
        if(pts >= 0) {
          if(!this.botones[this.seccionActual.seccion][i].platoComido.botonSi){
            seccionComida = false;
          }
        }
      }
    }

    if(numNo > 1) seccionComida = false;

    if(seccionComida){
      this.controlEventosService.emitir(pts);

      if(pts >= 0)
        this.engineService.mostrarAnimacion('confeti');
    }

  }


  cerrarModal(){
    this.modalRefComidas.hide();
    localStorage.removeItem('dia');
  }
}
