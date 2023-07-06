import { programInfo } from '../../interfaces/program-info.interface';
import { TGestorRecursos } from './TGestorRecursos';
import { HttpClient } from '@angular/common/http';

/*
Esta clase no esta completamente implementada, por lo que no se ha llegado a utilizar en el proyecto.
El codigo esta basado en otras partes de nuestro codigo donde usamos texturas y shaders y en codigo encontrado por internet:
https://www.tutorialspoint.com/webgl/webgl_drawing_a_quad.htm
https://webglfundamentals.org/webgl/lessons/webgl-text-texture.html
https://developer.mozilla.org/es/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
*/

export class TBillboard{

  public indQuad: number[] = [0,1,3,2,0];
  public vertsQuad = new Float32Array([
                        0.5, 0.5, 0.0,
                        0.0, 0.5, 0.0,
                        0.5, 0.0, 0.0,
                        0.0, 0.0, 0.0
                    ]);
  public programIdBillboard: WebGLProgram;

  private bquad: any = null;
  public http: HttpClient;


  public crearBillboard(gl: WebGLRenderingContext, programInfo: programInfo, http: HttpClient){
    this.http = http;
    this.dibujarBillboard(gl, programInfo);
  }

  public async crearShadersInfo(gl: WebGLRenderingContext){

    // Crear los shaders
    var vertCode =
      'attribute vec3 coordinates;' +
      'void main(void) {' +
          ' gl_Position = vec4(coordinates, 1.0);' +
      '}';

    var fragCode =
      'void main(void) {' +
        ' gl_FragColor = vec4(0.5, 0.1, 0.0, 1.0);' +
      '}';

    var vShaderId = gl.createShader(gl.VERTEX_SHADER);
    var fShaderId = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vShaderId,vertCode);
    gl.shaderSource(fShaderId,fragCode);

    gl.compileShader(vShaderId);
    gl.compileShader(fShaderId);


    // Crear el programa y asociarle los shaders y enlazarlo todo
    this.programIdBillboard = gl.createProgram();
    gl.attachShader(this.programIdBillboard, vShaderId);
    gl.attachShader(this.programIdBillboard, fShaderId);
    gl.linkProgram(this.programIdBillboard);

    if (!gl.getProgramParameter(this.programIdBillboard, gl.LINK_STATUS)) {
      console.error('No ha sido posible inicializar el Shader: ' + gl.getProgramInfoLog(this.programIdBillboard));
    }

    // Una vez creado el programa, podemos borrar los shaders
    gl.deleteShader(vShaderId);
    gl.deleteShader(fShaderId);

    // Ahora se puede usar en cualquier momento
    gl.useProgram(this.programIdBillboard);
  }

  public async dibujarBillboard(gl: WebGLRenderingContext, programInfo: programInfo): Promise<void>{
/*
    var gestor = new TGestorRecursos(this.http);
    var recTextura = gestor.getRecursosTextura('billboardText.png', gl);

     // textura
     const texturaVert = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, texturaVert);
     const texturaCoor = this.vertsQuad;
     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturaCoor),gl.STATIC_DRAW);

     // BUFFER TEXTURE
     gl.bindBuffer(gl.ARRAY_BUFFER, texturaVert);
     gl.vertexAttribPointer(programInfo.attribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(programInfo.attribLocations.texCoord);

     gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, (await recTextura).crearTextura);
      gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
*/
    // quad (billboard)
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    const verticesQuad = this.vertsQuad;
    gl.bufferData(gl.ARRAY_BUFFER, verticesQuad, gl.STATIC_DRAW);

    this.bquad = quadBuffer;

    // BUFFER QUAD
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bquad);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.drawElements(gl.TRIANGLE_STRIP, this.indQuad.length, gl.UNSIGNED_SHORT, 0);
  }
}
