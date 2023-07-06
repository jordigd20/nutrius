import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dibujar-punto',
  templateUrl: './dibujar-punto.component.html',
  styleUrls: ['./dibujar-punto.component.css']
})
export class DibujarPuntoComponent implements OnInit {

  ngOnInit(): void {
    this.start();
   }

   start(){
    // step 1 - prepare the canvas and get the webgl rendering context
    var canvas : any = document.getElementById("mycanvas");
    var gl = canvas.getContext("experimental-webgl");

    // var context = canvas.getContext('webgl', {
    //     antialias: false,
    //     stencil: false
    // });

    // step 2 - define the geometry and store in the buffer objects
    var vertices = [-0.5, 0.5, 0.0, 0.0, 0.5, 0.0, -0.25, 0.25, 0.0];
    var indices = [0, 1, 2];

    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // var index_buffer = gl.createBuffer();
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

        // step 3 - create and compile the shader programs
    var vertCode = 'attribute vec3 coordinates;' + 'void main(void){' + 'gl_Position = vec4(coordinates, 1.0);' + 'gl_PointSize = 10.0;' + '}';

        var vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, vertCode);
        gl.compileShader(vertShader);

        var fragCode = 'void main(void) {' + ' gl_FragColor = vec4(1, 0.5, 0.0, 1);' + '}';
        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, fragCode);
        gl.compileShader(fragShader);

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertShader);
        gl.attachShader(shaderProgram, fragShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);

        // step 4 - associate the shader programs to buffer objects
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        var coordinatesVar = gl.getAttribLocation(shaderProgram, "coordinates");
        gl.vertexAttribPointer(coordinatesVar, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coordinatesVar);

        // step 5 - drawing the required object
        gl.drawArrays(gl.POINTS, 0, 3);

   }

}
