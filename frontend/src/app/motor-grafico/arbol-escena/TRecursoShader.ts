import { TRecurso } from "./TRecurso";
import { mat4 } from "gl-matrix";
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
export class TRecursoShader extends TRecurso{

  private programId: WebGLProgram;
  private fShaderCode: string;
  private vShaderCode: string;
  private http: HttpClient;

  constructor(http: HttpClient){
    super();
    this.http = http;
  }

  public async setShaders(gl: WebGLRenderingContext) {
    let vShaderId, fShaderId;

    // Crear los shaders
    vShaderId = gl.createShader(gl.VERTEX_SHADER);
    fShaderId = gl.createShader(gl.FRAGMENT_SHADER);

    if(this.getNombre()=='normal'){
      [this.vShaderCode, this.fShaderCode] = await Promise.all([
        this.cargarFichero('vertexShader.glsl'),
        this.cargarFichero('fragmentShader.glsl')
      ]);
    }
    else if(this.getNombre()=='select'){
      [this.vShaderCode, this.fShaderCode] = await Promise.all([
        this.cargarFichero('selectVertShader.glsl'),
        this.cargarFichero('selectFragShader.glsl')
      ]);
    }
    else if(this.getNombre()=='water'){
      [this.vShaderCode, this.fShaderCode] = await Promise.all([
        this.cargarFichero('waterVertShader.glsl'),
        this.cargarFichero('waterFragShader.glsl')
      ]);
    }

    gl.shaderSource(vShaderId, this.vShaderCode);
    gl.shaderSource(fShaderId, this.fShaderCode);

    gl.compileShader(vShaderId);
    gl.compileShader(fShaderId);

    // Crear el programa, asociarles los shaders y enlazarlo todo
    this.programId = gl.createProgram();
    gl.attachShader(this.programId, vShaderId);
    gl.attachShader(this.programId, fShaderId);
    gl.linkProgram(this.programId);

    if (!gl.getProgramParameter(this.programId, gl.LINK_STATUS)) {
      console.error('No ha sido posible inicializar el Shader: ' + gl.getProgramInfoLog(this.programId));
    }

    // Una vez creado el programa, podemos borrar los shaders
    gl.deleteShader(vShaderId);
    gl.deleteShader(fShaderId);

    // Ahora se puede usar en cualquier momento
    gl.useProgram(this.programId);

  }

  public getProgramId() {
    return this.programId;
  }

  public async cargarFichero(nombre: string): Promise<string> {
    return await firstValueFrom(this.http.get(`../../../assets/motor/shaders/${nombre}`, {responseType: 'text'}));
  }

  public setInt(gl: WebGLRenderingContext, uniformVariable: string, value: number): void {
    const uniformLocation = gl.getUniformLocation(this.programId, uniformVariable);
    if(uniformLocation != null) gl.uniform1i(uniformLocation, value);
  }

  public setFloat(gl: WebGLRenderingContext, uniformVariable: string, value: number): void {
    const uniformLocation = gl.getUniformLocation(this.programId, uniformVariable);
    if(uniformLocation != null) gl.uniform1f(uniformLocation, value);
  }

  public setFloatArray(gl: WebGLRenderingContext, uniformVariable: string, value: mat4): void {
    const uniformLocation = gl.getUniformLocation(this.programId, uniformVariable);
    if(uniformLocation != null) gl.uniform4fv(uniformLocation, value);
  }

  public setMat4(gl: WebGLRenderingContext, uniformVariable: string, transpose: boolean, value: mat4): void {
    const uniformLocation = gl.getUniformLocation(this.programId, uniformVariable);
    if(uniformLocation != null) gl.uniformMatrix4fv(uniformLocation, transpose, value);
  }

}
