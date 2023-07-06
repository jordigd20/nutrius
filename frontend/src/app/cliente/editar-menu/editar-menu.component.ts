import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import listaElementos from 'src/assets/json/elementos.json';
import { MenuPerfilService } from '../../services/menuperfil.service';
import { MenuPerfil } from '../../models/menuperfil.model';
import { PerfilService } from 'src/app/services/perfil.service';
import { MenuService } from 'src/app/services/menu.service';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import Swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';
import { ControlEventosService } from '../../services/control-eventos.service';


@Component({
  selector: 'app-editar-menu',
  templateUrl: './editar-menu.component.html',
  styleUrls: ['./editar-menu.component.css'],
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
export class EditarMenuComponent implements OnInit {

  elementos: any = listaElementos;

  Object = Object;

  public submited = false;
  public uidMenuPerfil: string = '';
  public idPerfil: string = '';
  public nombrePerfil: string = '';
  public nombreMenu: string = '';
  public comidasFalladas: number = -1;
  public puntos: number = -1;
  public menu: MenuPerfil[] = [];
  public idMenu: string = '';
  public premium: boolean = false;

  public platosPerfilMenu: any[][] = [];
  public platosMenu: any[][] = [];
  public platoMenuCompletado: any[][] = [];
  public platoMenuFallado: any[][] = [];

  public pos: string = '';

  public lunesFecha: string = '';
  public domingoFecha: string = '';
  public dataHoverPlatos: boolean[][] = [];
  public platosDestacados: boolean[][] = [];
  public platoEliminandose: boolean[][] = [];
  public platoDestacado: any = {};

  public loading: boolean = true;


  constructor(private menuPerfilService: MenuPerfilService,
              private perfilService: PerfilService,
              private menuService: MenuService,
              private route: ActivatedRoute,
              private router: Router,
              private controlEventosService: ControlEventosService,
              ) { }

  ngOnInit(): void {
    this.uidMenuPerfil = this.route.snapshot.params['idmp'];
    this.idPerfil = this.route.snapshot.params['uid'];
    this.comprobarPremium();
    this.cargarMenuPerfil();
    this.obtenerDatosPDF();
    this.controlEventosService.rutaPerfiles(this.router.url);
  }

  comprobarPremium(){
    let rol = localStorage.getItem('rol');
    if(rol === 'ROL_PREMIUM') this.premium = true;
  }

  cargarMenuPerfil(){
    this.submited = false;
    if(this.uidMenuPerfil !== '') {

      this.menuPerfilService.cargarMenuPerfil(this.uidMenuPerfil, true)
      .subscribe(async (res: any) => {
        if(!res['existeMenuPerfil']){
          this.router.navigateByUrl('/inicio/menus/'+this.idPerfil);
          return;
        }

        localStorage.setItem('fechaMenu', res['existeMenuPerfil']['menusem']['lunes'].fecha);

        this.idMenu = res['existeMenuPerfil'].menu_id;
        this.comidasFalladas = res['existeMenuPerfil'].comidas_falladas;
        this.puntos = res['existeMenuPerfil'].puntos_obtenidos;
        this.menu[0] = res['existeMenuPerfil'];

        if(sessionStorage.getItem('destacarPlato')) this.buscarPlatoADestacar();

        this.recorrerPlatos(res);

        this.lunesFecha = this.convertirFecha(new Date(res['existeMenuPerfil'].menusem["lunes"]["fecha"]));
        this.domingoFecha = this.convertirFecha(new Date(res['existeMenuPerfil'].menusem["domingo"]["fecha"]));

        this.menuService.cargarMenu(this.idMenu).subscribe((ress:any)=>{
          this.nombreMenu = ress['menus'].nombre;
        });

        this.loading = false;

      });
    }
  }

  recorrerPlatos(res: any) {
      let contador = 0;
      this.platosPerfilMenu = [];
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 5; j++) {
          let dia = this.elementos[4].elementos[i].propiedad;
          let comida = this.elementos[2].elementos[j].propiedad;
          let numPlatos = res['existeMenuPerfil'].menusem[dia]["comidas"][comida]["platos"].length;
          this.platoMenuCompletado[contador] = [];
          this.platoMenuFallado[contador] = [];

          for(let k = 0; k < numPlatos; k++) {

            if(k == 0) {
              this.platosPerfilMenu[contador] = [];
              this.platosMenu[contador] = [];
              this.dataHoverPlatos[contador] = [];
              this.platosDestacados[contador] = [];
              this.platoEliminandose[contador] = [];
            }

            this.platosPerfilMenu[contador][k] = res['existeMenuPerfil'].menusem[dia]["comidas"][comida]["platos"][k].plato;
            this.platosMenu[contador][k] = res['existeMenuPerfil'].menusem[dia]["comidas"][comida]["platos"][k].plato.plato_id;

            this.dataHoverPlatos[contador][k] = false;
            this.platosDestacados[contador][k] = false;
            this.platoEliminandose[contador][k] = false;

            if(this.platosPerfilMenu[contador][k]._id == this.platoDestacado.id &&
              contador == this.platoDestacado.posArray) {
                this.platosDestacados[contador][k] = true;
            }

            this.platoMenuCompletado[contador][k] = res['existeMenuPerfil'].menusem[dia]["comidas"][comida]["platos"][k].completado;
            this.platoMenuFallado[contador][k] = res['existeMenuPerfil'].menusem[dia]["comidas"][comida]["platos"][k].fallado;
          }

          contador++;
        }
      }
  }

  buscarPlatoADestacar() {
    const idPlatoDestacado = JSON.parse(sessionStorage.getItem('destacarPlato')).plato_id;
    const posDia = Number(JSON.parse(sessionStorage.getItem('destacarPlato')).pos_dia);
    const posComida = Number(JSON.parse(sessionStorage.getItem('destacarPlato')).pos_comida);

    this.platoDestacado = {
      id: idPlatoDestacado,
      posArray: posDia*5+posComida,
    };
  }

  destacarPlatoNuevo(i: number, j: number) {
    const esDestacado = this.platosDestacados[i][j];

    if(esDestacado) sessionStorage.removeItem('destacarPlato');

    return esDestacado;
  }

  borrarPlato(pos_dia:number, pos_comida:number, pos_nplato:number, pos_eliminando: number){
    let dia = this.elementos[4].elementos[pos_dia].propiedad;
    let comida = this.elementos[2].elementos[pos_comida].propiedad;

    this.platoEliminandose[pos_eliminando][pos_nplato] = true;
    this.menuPerfilService.cargarMenusPerfil(this.uidMenuPerfil)
      .subscribe((res: any) => {
        res['existeMenuPerfil'].menusem![dia]["comidas"][comida]["platos"].splice(pos_nplato, 1);
        this.menu[0] = res['existeMenuPerfil'].menusem;
        this.menuPerfilService.actualizarMenuPerfil(this.uidMenuPerfil, res['existeMenuPerfil'])
        .subscribe( (ress: any) => {
          this.platoEliminandose[pos_eliminando][pos_nplato] = false;
          this.ngOnInit();
        }, (err) => {
          const msgerror = err.error.msg || 'No se pudo completar la acción de actualizar MenuPerfil, vuelva a intentarlo';
          Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
        });
      }, (err) => {
        const msgerror = err.error.msg || 'No se pudo completar la acción de obtener MenuPerfil, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror});
      });
  }

  recomendarSeccion(seccion: string) {
    sessionStorage.setItem('recomendarSeccion', seccion);
  }

  convertirFecha(datecita: Date): string{
    let year = datecita.getFullYear().toString();
    let month = datecita.getMonth()+1;
    let dt = datecita.getDate();
    let stringo= '';

    if (dt < 10) {
      stringo += '0' + dt.toString();
    }else{
      stringo += dt.toString();
    }
    stringo+='/';
    if (month < 10) {
      stringo += '0' + month.toString();
    }else{
      stringo += month.toString();
    }
    stringo+='/'+year.toString();
    return stringo;
  }

  mostrarHoverPlato(i: number, j: number) {
    this.dataHoverPlatos[i][j] = true;
  }

  esconderHoverPlato(i: number, j: number) {
    this.dataHoverPlatos[i][j] = false;
  }

  obtenerDatosPDF(){
    this.perfilService.cargarPerfil(this.idPerfil).subscribe((res: any) => {
      this.nombrePerfil = res['existePerfil'].nombre;
    });

    pdfMake.fonts = {
      Quicksand: {
        normal: 'Quicksand-Regular.ttf',
        bold: 'Quicksand-Bold.ttf',
        italics: 'Quicksand-Light.ttf',
        bolditalics: 'Quicksand-Medium.ttf'
      },
      Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
      },
    }

  }

  checkEstadoPlato(marcado: boolean, fallado: boolean){
    let resultado = -1;
    if(marcado){
      if(fallado){
        resultado = 0; //Fallado
      }else{
        resultado = 1; //Completado
      }
    }else{
      resultado = 2; //No completado
    }
    return resultado;
  }

  crearPDF(){
    const docDefinition = this.getDocumentDefinition();
    pdfMake.createPdf(docDefinition).open();

  }

  getDocumentDefinition() {
    return {
      pageOrientation: 'landscape',
      defaultStyle: {
        font: 'Roboto'
      },
      header: {
        margin: [10, 1, 5, 10],
        image: this.elementos[5].elementos[0].base64,
        width: 120
      },
      footer: {
        margin: [0, -22, 0, 20],
        image: this.elementos[5].elementos[1].base64,
        width: 60,
        alignment: 'right'
      },
      content:
      [
        {
          text: 'Menú de '+this.nombrePerfil,
          bold: true,
          fontSize: 22,
          alignment: 'center',
          margin: [0, 0, 0, 0],
          color: '#32325d',
        },
        {
          text: this.lunesFecha+' - '+this.domingoFecha,
          fontSize: 12,
          alignment: 'center',
          margin: [0, 5, 0, 0],
          color: '#32325d'
        },
        {
          text: this.nombreMenu,
          margin: [0, 0, 0, 0],
          decoration: 'underline',
          decorationStyle: 'dotted'
        },
        this.getTablaPDF(),
      ],
      info: {
        title: 'Menu NutriUs '+this.nombrePerfil,
        author: 'NutriUs',
        subject: 'MENU',
        keywords: 'MENU, NUTRIUS',
      },
        styles: {
          tableHeader: {
            bold: true,
            fillColor: '#cdf1ea',
            alignment: 'center',
            fontSize: 10,
            margin: [0, 10, 0, 10],
            color: '#525f7f'
          },
          tableCeldas: {
            alignment: 'center',
            margin: [0, 5, 0, 5],
            color: '#32325d'
          }
        }
    };
  }

  getTablaPDF(){
    var body = [];
    for(let i=0; i<6; i++){
      var comida = [];
      if(i==0){
        comida.push('');
        for(let y=0; y<7; y++){
          comida.push({text: this.elementos[4].elementos[y].mayus, style: 'tableHeader'});
        }
      }
      else{
        comida.push({text: this.elementos[2].elementos[i-1].mayus, style: 'tableHeader'});
        for(let y=0; y<7; y++){
          var platos = '';
          for(let z=0; z<this.platosMenu[y*5+(i-1)].length; z++){
            platos += this.platosMenu[y*5+(i-1)][z].nombre + '\n';
          }
          comida.push({text: platos, style: 'tableCeldas'});
        }
      }
      body.push(comida);
    }
    return {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        widths: [ '*', '*', '*', '*', '*', '*', '*', '*' ],
        body: [
          ...body
        ]
      }
    };
  }

}
