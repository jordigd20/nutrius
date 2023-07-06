import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PerfilService } from '../../services/perfil.service';
import listaElementos from 'src/assets/json/elementos.json';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { platosConsumidos, comidasHoy, cargarChartAltura, cargarChartPeso, cargarTranscAltura, cargarTranscPeso } from '../../helpers/seguimientodatos';
import { PlatoPerfil } from 'src/app/models/platoperfil.model';
import { PlatoPerfilService } from '../../services/platoperfil.service';
import { firstValueFrom } from 'rxjs';
import { MenuPerfilService } from '../../services/menuperfil.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Seguimiento } from 'src/app/models/seguimiento.model';
import { calcularEdad, convertirFecha } from '../../helpers/convertirfecha';

@Component({
  selector: 'app-printpdf',
  templateUrl: './printpdf.component.html',
  styleUrls: ['./printpdf.component.css']
})
export class PrintpdfComponent implements OnInit {

  @ViewChild('grafica1') grafica1: BaseChartDirective | undefined;
  @ViewChild('grafica2') grafica2: BaseChartDirective | undefined;
  @ViewChild('grafica3') grafica3: BaseChartDirective | undefined;

  public nombrePerfil: string = '';
  public idPerfil: string = '';
  elementos: any = listaElementos;

  public isHidden: boolean = false;

  public grafsImg: string[] = [];
  public chartsImg: string[] = [];
  public imgsrc: string[] = [];

  public platosConsumidos: PlatoPerfil[] = [];

  public comidasCompletadasHoy: any[] = [
    { comida: 'Desayuno', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Almuerzo', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Comida', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Merienda', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
    { comida: 'Cena', completada: false, img: '../../../assets/img/platos/noimage.jpg' },
  ];

  public platosMasGustados: PlatoPerfil[] = [];
  public platosMenosGustados: PlatoPerfil[] = [];
  public platosMasFallados: PlatoPerfil[] = [];

  // Datos platos para las graficas
  public tipoGrafica: ChartType = 'bar';
  public datosPlatosMasGustados: ChartData<'pie', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: 'Platos más gustados',
    backgroundColor: '#00B593', hoverBackgroundColor: '#525F7F' }]
  };
  public datosPlatosMenosGustados: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: 'Platos menos gustados',
    backgroundColor: '#00B593', hoverBackgroundColor: '#525F7F' }]
  };
  public datosPlatosMasFallados: ChartData<'bar', number[], string | string[]> = {
    labels: [], datasets: [{ data: [], label: 'Platos más fallados',
    backgroundColor: '#00B593', hoverBackgroundColor: '#525F7F' }]
  };
  public opcionesGrafica: ChartConfiguration['options'] = {
    responsive: true,
    scales: { y: { ticks: { precision: 0 } } },
    plugins: { legend: { display: true, position: 'top' } },
  };

  public listaSeguimiento: Seguimiento[] = [];
  public fechasSeg: string[] = [];
  public totalSeguimiento: number = 0;

  public perfSexo: number = 0;
  public perfPesoAct: number = 0;
  public perfAltAct: number = 0;
  public perfPesoObj: number = 0;
  public perfEdad: number = 0;

  public chartPeso2: any = null;
  public chartAltura2: any = null;
  public transcPeso2: any = null;
  public transcAltura2: any = null;

  public textoBut: string = 'Obtener PDF';
  public activo: boolean = true;


  @Input('id') masterName = '';

  constructor(private perfilService: PerfilService,
              private platoPerfilService: PlatoPerfilService,
              private menuPerfilService: MenuPerfilService) { }


  ngOnInit(): void {
    this.idPerfil = this.masterName;
    this.cargarGraficas();
  }

  async cargarGraficas(){
    // carga de datos necesarios para las graficas
    const res: any = await firstValueFrom(this.perfilService.cargarPerfil(this.idPerfil));
    this.nombrePerfil = res['existePerfil'].nombre;
    this.perfPesoAct = res['existePerfil'].peso_actual;
    this.perfAltAct = res['existePerfil'].altura_actual;
    if(res['existePerfil'].peso_objetivo != -1){
      this.perfPesoObj = res['existePerfil'].peso_objetivo;
    }
    if(res['existePerfil'].sexo == 'NIÑO'){
      this.perfSexo = 1;
    }
    else if(res['existePerfil'].sexo == 'NIÑA'){
      this.perfSexo = 2;
    }
    this.perfEdad = await calcularEdad(res['existePerfil'].fecha_nacimiento);


    const res4: any = await firstValueFrom(this.perfilService.cargarPesoAltura(this.idPerfil));
    this.listaSeguimiento = res4['seguimiento'];
    this.totalSeguimiento = res4['page'].total;
    for(let i=0; i<this.totalSeguimiento; i++){
      let datecita = new Date(this.listaSeguimiento[i].fecha!);
      this.fechasSeg.push(await convertirFecha(datecita));
    }

    this.cargarPlatosPerfilMasGustados();
    this.cargarPlatosPerfilMenosGustados();
    this.cargarPlatosPerfilMasFallados();
    this.chartPeso2 = await cargarChartPeso(this.perfPesoAct,this.perfEdad,this.perfSexo,'2');
    this.chartAltura2 = await cargarChartAltura(this.perfAltAct,this.perfEdad,this.perfSexo,'2');
    this.transcPeso2 = await cargarTranscPeso(this.listaSeguimiento,this.fechasSeg,'2');
    this.transcAltura2 = await cargarTranscAltura(this.listaSeguimiento,this.fechasSeg,'2');

    this.isHidden=true;
  }

  async obtenerDatosPDF(){

    const res2: any = await firstValueFrom(this.platoPerfilService.cargarPlatosPerfilComidos(0, this.idPerfil));
    this.platosConsumidos = await platosConsumidos(res2);

    const res3: any = await firstValueFrom(this.menuPerfilService.cargarMenusPerfil(this.idPerfil));
    this.comidasCompletadasHoy = await comidasHoy(res3,this.platoPerfilService);

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
      }
    }


  }

  async crearPDF(){
    this.textoBut = 'Creando PDF';
    if(!this.activo) return;
    this.activo = false;
    await this.obtenerDatosPDF();
    this.grafsImg[0] = this.grafica1!.toBase64Image()!.toString();
    this.grafsImg[1] = this.grafica2!.toBase64Image()!.toString();
    this.grafsImg[2] = this.grafica3!.toBase64Image()!.toString();
    this.chartsImg[0] = this.chartPeso2.toBase64Image()!.toString();
    this.chartsImg[1] = this.chartAltura2.toBase64Image()!.toString();
    this.chartsImg[2] = this.transcPeso2.toBase64Image()!.toString();
    this.chartsImg[3] = this.transcAltura2.toBase64Image()!.toString();
    for(let i=0; i<5; i++){
      this.imgsrc[i] = await this.cargar2(this.comidasCompletadasHoy[i].img);
    }

    const docDefinition = this.getDocumentDefinition();
    pdfMake.createPdf(docDefinition).open();

    this.textoBut = 'Obtener PDF';
    this.activo = true;
  }

  getDocumentDefinition() {


    return {
      pageOrientation: 'landscape',
      defaultStyle: {
        font: 'Roboto'
      },
      header: {
        margin: [10, 1, 5, 100],
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
          text: 'Seguimiento de '+this.nombrePerfil,
          bold: true,
          fontSize: 22,
          alignment: 'center',
          margin: [0, 0, 0, 0],
          color: '#32325d',
        },
        {
          text: 'Comidas',
          style: 'titulosTab'
        },
        {
          text: 'Comidas de hoy',
          style: 'titulosIn'
        },
        this.getComidasHoy(),
        this.getImgsHoy(),
        this.getCompletHoy(),
        {
          text: 'Platos consumidos',
          style: 'titulosIn'
        },
        this.getTablaSegCom(),
        {
          text: 'Gráficos',
          style: 'titulosIn'
        },
        {
          columns: [
            {
              image: this.grafsImg[0],
              width: 350
            },
            {
              image: this.grafsImg[1],
              width: 350
            },
          ],
          columnGap: 40
        },
        {
          image: this.grafsImg[2],
          width: 350,
          alignment: 'center',
          margin: [0, 20, 0, 10],
          pageBreak: 'after'
        },
        {
          text: 'Peso y altura',
          style: 'titulosTab'
        },
        {
          text: 'Registros de peso y altura',
          style: 'titulosIn'
        },
        this.getRegistrosPesoAlt(),
        {
          text: 'Percentiles de peso y altura',
          style: 'titulosIn'
        },
        {
          columns: [
            {
              image: this.chartsImg[0],
              width: 350
            },
            {
              image: this.chartsImg[1],
              width: 350
            },
          ],
          columnGap: 40
        },
        {
          text: 'Transcurso de peso y altura',
          style: 'titulosIn'
        },
        {
          columns: [
            {
              image: this.chartsImg[2],
              width: 350
            },
            {
              image: this.chartsImg[3],
              width: 350
            },
          ],
          columnGap: 40
        },
      ],
      info: {
        title: 'Seguimiento NutriUs '+this.nombrePerfil,
        author: 'NutriUs',
        subject: 'SEGUIMIENTO',
        keywords: 'SEGUIMIENTO, NUTRIUS',
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
          },
          titulosTab: {
            fontSize: 16,
            margin: [0, 20, 0, 10],
            decoration: 'underline',
            decorationStyle: 'dotted'
          },
          titulosIn: {
            margin: [0, 20, 0, 10],
            color: '#32325d'
          },
          comidasHoy: {
            width: '*',
            alignment: 'center'
          }
        }
    };
  }


  getTablaSegCom(){
    var body = [];
    for(let i=0; i<this.platosConsumidos.length+1; i++){
      var comida = [];
      if(i==0){
        comida.push({text: 'PLATO', style: 'tableHeader'});
        comida.push({text: 'FECHA', style: 'tableHeader'});
        comida.push({text: 'VECES FALLADO', style: 'tableHeader'});
        comida.push({text: 'VECES GUSTADO', style: 'tableHeader'});
        comida.push({text: 'VECES NO GUSTADO', style: 'tableHeader'});
      }
      else{
        comida.push({text: this.platosConsumidos[i-1].plato_id.nombre, style: 'tableCeldas'});
        comida.push({text: this.platosConsumidos[i-1].info_plato[this.platosConsumidos[i-1].info_plato.length-1].fecha, style: 'tableCeldas'});
        comida.push({text: this.platosConsumidos[i-1].veces_fallado, style: 'tableCeldas'});
        comida.push({text: this.platosConsumidos[i-1].veces_gustado, style: 'tableCeldas'});
        comida.push({text: this.platosConsumidos[i-1].veces_no_gustado, style: 'tableCeldas'});
      }
      body.push(comida);
    }
    return {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        widths: [ '*', '*', '*', '*', '*'],
        body: [
          ...body,
        ],
      },
      pageBreak: 'after'
    };
  }

  getComidasHoy(){
    var body = [];
    for(let i=0; i<5; i++){
      body.push({text: this.comidasCompletadasHoy[i].comida, style: 'comidasHoy'});
    }
    return {
      columns: [
        ...body
      ]
    };
  }

  async cargar2(url:string){
    const res = await this.leerArchivo(url);
    const miblob = await res.blob();
    const datos = await this.readAsDataURL(miblob);
    return datos as string;
  }

  async leerArchivo(url:string) {
    return fetch(url);
  }

  async readAsDataURL(file:any ) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onerror = reject;
        fr.onload = function() {
            resolve(fr.result);
        }
        fr.readAsDataURL(file);
    });
  }

  getImgsHoy(){
    var body = [];
    for(let i=0; i<5; i++){

      body.push({image: this.imgsrc[i], width: 120});
    }
    return {
      columns: [
        ...body
      ],
      columnGap: 40
    };
  }

  getCompletHoy(){
    var body = [];
    for(let i=0; i<5; i++){
      if(this.comidasCompletadasHoy[i].completada)
        body.push({text: 'Completado', style: 'comidasHoy', margin: [0, 0, 0, 5]});
      else
      body.push({text: 'No Completado', style: 'comidasHoy', margin: [0, 0, 0, 5]});
    }
    return {
      columns: [
        ...body
      ]
    };
  }

  getRegistrosPesoAlt(){
    var body = [];
    for(let i=0; i<this.listaSeguimiento.length+1; i++){
      var comida = [];
      if(i==0){
        comida.push({text: 'FECHA', style: 'tableHeader'});
        comida.push({text: 'PESO', style: 'tableHeader'});
        comida.push({text: 'ALTURA', style: 'tableHeader'});
        comida.push({text: 'VARIACIÓN', style: 'tableHeader'});
        comida.push({text: 'DIF. CON OBJETIVO', style: 'tableHeader'});
      }
      else{
        comida.push({text: this.fechasSeg[i-1], style: 'tableCeldas'});
        comida.push({text: this.listaSeguimiento[i-1].peso+' kg', style: 'tableCeldas'});
        comida.push({text: this.listaSeguimiento[i-1].altura+' cm', style: 'tableCeldas'});
        comida.push({text: this.listaSeguimiento[i-1].variacion+' kg', style: 'tableCeldas'});
        comida.push({text: this.listaSeguimiento[i-1].difObjetivo+' kg', style: 'tableCeldas'});
      }
      body.push(comida);
    }
    return {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        widths: [ '*', '*', '*', '*', '*'],
        body: [
          ...body,
        ],
      },
      pageBreak: 'after'
    };
  }

  cargarPlatosPerfilMasGustados() {
    this.platoPerfilService.cargarPlatosPerfilMasGustados(this.idPerfil).subscribe(
      async (res: any) => {
        for(let i = 0; i < res.resultados.length; i++){
          this.platosMasGustados.push(res.resultados[i].plato_id);
          this.datosPlatosMasGustados.labels?.push(res.resultados[i].plato_id.nombre);
          this.datosPlatosMasGustados.datasets[0].data.push(res.gustados[i].totalGustado);
        }

        this.grafica1?.update();
      });
    }

  cargarPlatosPerfilMenosGustados() {
    this.platoPerfilService.cargarPlatosPerfilMenosGustados(this.idPerfil).subscribe(
      async (res: any) => {
        for(let i = 0; i < res.resultados.length; i++){
          this.platosMenosGustados.push(res.resultados[i].plato_id);
          this.datosPlatosMenosGustados.labels?.push(res.resultados[i].plato_id.nombre);
          this.datosPlatosMenosGustados.datasets[0].data.push(res.no_gustados[i].totalNoGustado);
        }

        this.grafica2?.update();
    });
  }

  cargarPlatosPerfilMasFallados() {
    this.platoPerfilService.cargarPlatosPerfilMasFallados(this.idPerfil).subscribe(
      async (res: any) => {
        for(let i = 0; i < res.resultados.length; i++){
          this.platosMasFallados.push(res.resultados[i].plato_id);
          this.datosPlatosMasFallados.labels?.push(res.resultados[i].plato_id.nombre);
          this.datosPlatosMasFallados.datasets[0].data.push(res.fallados[i].totalFallado);
        }

        this.grafica3?.update();
    });
  }

}
