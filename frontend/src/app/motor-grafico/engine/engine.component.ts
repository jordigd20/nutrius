import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from '../../services/engine.service';
@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html',
  styleUrls: ['./engine.component.css']
})
export class EngineComponent implements OnInit {

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private engineService: EngineService) { }

  ngOnInit(): void {
    this.engineService.createScene(this.rendererCanvas, 1);
    this.engineService.animate();
  }

}
