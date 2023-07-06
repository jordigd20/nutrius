import { TRecurso } from "./TRecurso";
import { HttpClient } from '@angular/common/http';
import { imagenConSrc } from '../../helpers/motorfunciones';

export class TRecursoTextura extends TRecurso{

  public id: WebGLTexture;
  public width: number;
  public height: number;
  public imagen: HTMLImageElement;
  public url: string;

  private http:  HttpClient;

  constructor(http: HttpClient){
    super();
    this.http = http;
  }

  public async cargarFichero(nombre: string, gl: WebGLRenderingContext){
    // cargar imagen textura
    this.imagen = await imagenConSrc('../../../assets/motor/texturas/'+nombre);

    //asignacion variables
    this.width = this.imagen.width;
    this.height = this.imagen.height;

    //crear textura
    this.id = await this.crearTextura(gl);

    return this.id;
  }

  public async crearTextura(gl: WebGLRenderingContext){

    //crear textura
    let textura = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, textura);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.imagen);
    if (this.isPowerOf2(this.width) && this.isPowerOf2(this.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    return textura;
  }

  public isPowerOf2(value: number) {
    return (value & (value - 1)) == 0;
  }
}

