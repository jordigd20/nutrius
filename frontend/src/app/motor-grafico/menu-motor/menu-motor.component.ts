import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EngineService } from '../../services/engine.service';

@Component({
  selector: 'app-menu-motor',
  templateUrl: './menu-motor.component.html',
  styleUrls: ['./menu-motor.component.css']
})
export class MenuMotorComponent implements OnInit {

  @ViewChild('rendererCanvasMenu', {static: true})
  public rendererCanvasMenu!: ElementRef<HTMLCanvasElement>;

  constructor(private engineService: EngineService) { }

  ngOnInit(): void {
    this.engineService.createScene(this.rendererCanvasMenu, 3);
    this.engineService.animate();
  }

}
