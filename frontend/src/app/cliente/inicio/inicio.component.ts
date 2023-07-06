import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from '../../services/engine.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  public enlaceWebCorporativa: string = '';
  public enlaceBlog: string = '';
  public enlaceContacto: string = '';

  public fotoIsla: string = '../../../assets/img/pagina_principal/pp-isla.PNG';
  public numCar: number = 1;

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private engineService: EngineService) { }

  ngOnInit(): void {
    this.enlaceWebCorporativa = `https://${location.host}/areka`;
    this.enlaceBlog = `https://${location.host}/areka/blog/`;
    this.enlaceContacto = `https://${location.host}/areka/contacto/`;
    this.engineService.createScene(this.rendererCanvas, 2);
    this.engineService.animate();
  }

  cambiarFoto(){
    if(this.numCar==1){
      this.fotoIsla = '../../../assets/img/pagina_principal/pp-tarde.png';
      this.numCar++;
    }else if(this.numCar==2){
      this.fotoIsla = '../../../assets/img/pagina_principal/pp-noche.png';
      this.numCar++;
    }else if(this.numCar==3){
      this.fotoIsla = '../../../assets/img/pagina_principal/pp-isla.PNG';
      this.numCar=1;
    }
  }

  ngOnDestroy(): void {
    this.engineService.destroyOrbitControl();
  }
}
