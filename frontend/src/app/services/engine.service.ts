import { ElementRef, Injectable, NgZone } from '@angular/core';
import { ThreeEngine } from '../fachada/ThreeEngine';
import { TagEngine } from '../fachada/TagEngine';
import { HttpClient } from '@angular/common/http';
import { vec3 } from 'gl-matrix';
import { ControlEventosService } from './control-eventos.service';
@Injectable({
  providedIn: 'root'
})
export class EngineService {
  private escenaId!: number;
  private motor!: TagEngine | ThreeEngine;

  constructor(private ngZone: NgZone,
              private http: HttpClient,
              private controlEventosService:ControlEventosService) { }

  public ngOnDestroy(): void {
    this.motor.cancelarAnimacionFrame();
  }

  public async createScene(canvas: ElementRef<HTMLCanvasElement>, id: number, mods?: any) {

    if(id == 1 || id == 2 || id == 10) this.motor = new TagEngine(this.controlEventosService);
    else this.motor = new ThreeEngine();

    if(this.motor instanceof TagEngine)
      this.motor.initCargarRecursos(this.http);

    this.escenaId = id;
    await this.motor.crearEscena(id, canvas.nativeElement);

    if(this.escenaId == 1) this.motor.crearEscenaIslas();
    else if(this.escenaId == 2) this.motor.crearEscenaInicio();
    else if(this.escenaId == 3) this.motor.crearEscenaMenu();
    else if(this.escenaId == 4) this.motor.crearEscenaComidas();
    else if(this.escenaId == 10) this.motor.crearEscenaPrueba(mods);
  }

  public cambiarCamaraAParalela() {
    this.motor.cambiarCamaraAParalela();
  }

  public zoomIsla(traslacion: vec3, escalado: vec3, rotacion: vec3) {
    this.motor.zoomIsla(traslacion, escalado, rotacion);
  }

  public trasladarEscena(traslacion: number, limiteMayor: number, limiteMenor: number) {
    this.motor.trasladarEscena(traslacion, limiteMayor, limiteMenor);
  }

  public setTraslacionEscena(traslacion: vec3) {
    this.motor.setTraslacionEscena(traslacion);
  }

  public setLimitePosMayor(limite: number) {
   this.motor.setLimitePosMayor(limite);
  }

  public setLimitePosMenor(limite: number) {
    this.motor.setLimitePosMenor(limite);
  }

  public mostrarAnimacion(tipoAnimacion: string) {
    this.motor.mostrarAnimacion(tipoAnimacion);
  }

  public trasladarLuz(traslacionLuz: vec3) {
    this.motor.trasladarLuz(traslacionLuz);
  }

  public animate(): void {
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.motor.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.motor.render();
        });
      }

      if(this.escenaId==2) this.motor.actualizarControles();

      if(this.escenaId != 2) {
        window.addEventListener('resize', () => {
         this.motor.resize();
        });
      }
    });
  }

  public destroyOrbitControl(): void {
    this.motor.destruirControles();
  }

}
