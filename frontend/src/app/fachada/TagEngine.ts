import { vec3, glMatrix } from 'gl-matrix';
import { HttpClient } from '@angular/common/http';
import { TMotorTAG } from '../motor-grafico/arbol-escena/TMotorTAG';
import { Modelo } from '../interfaces/modelo-grafico.interface';
import listaElementos from 'src/assets/json/elementos.json';
import { ControlEventosService } from '../services/control-eventos.service';

export class TagEngine {
  private gl: WebGLRenderingContext;
  private http: HttpClient;
  private canvas: HTMLCanvasElement;
  private motor: TMotorTAG;
  private idEscena: number;
  private frameId: number;
  private obj_id: number = -1;

  private fb: WebGLFramebuffer;
  private db: WebGLRenderbuffer;
  private targetTexture: WebGLTexture;

  //EVENTOS RATON
  private drag: boolean = false;
  private mouse = {
    lastX: -1,
    lastY: -1
  };
  public angle = {
    x:0,
    y:0
  };
  public rot_vel: number = 0.7;
  private traslacionEscena: number = 0;
  private mouseStartedMoving: boolean = false;
  private mouseMoved: boolean = false;
  private limitePosMayor: number = 10;
  private limitePosMenor: number = -15;

  elementos: any = listaElementos;

  constructor(private controlEventosService:ControlEventosService) {

    glMatrix.setMatrixArrayType(Array);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
  }

  initCargarRecursos(http: HttpClient) {
    this.http = http;
    this.motor = new TMotorTAG(this.http);
  }

  async crearEscena(id: number, canvas: HTMLCanvasElement){
    this.gl = await this.initWebGL(canvas);
    this.canvas = canvas;
    this.idEscena = id;

    localStorage.setItem('recursos', 'false');
    localStorage.setItem('porcentaje','0');
    localStorage.setItem('pick', '-1');
    localStorage.setItem('motor', 'true');

    await this.motor.createShaderInfo(this.gl);

    await this.motor.crearEscena(this.gl, id);
    this.eventosMouse();
    if(id==1 || id==10) await this.selectBuffers();
    this.animate();
  }

  async setFramebufferAttachmentSizes(width:number, height:number) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.targetTexture);
    const level = 0;
    const border = 0;
    const format = this.gl.RGBA;
    const type = this.gl.UNSIGNED_BYTE;
    const data: ArrayBufferView = null;
    this.gl.texImage2D(this.gl.TEXTURE_2D, level, format,width, height, border,format, type, data);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.db);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16,width, height);
  }

  async selectBuffers(){
    // Crear textura a la que renderizar
    this.targetTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.targetTexture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    // Crear y vincular el framebuffer
    this.fb = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);

    // Crear un depth renderbuffer
    this.db = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.db);

    // Adjuntar la textura
    const attachmentPoint = this.gl.COLOR_ATTACHMENT0;
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachmentPoint, this.gl.TEXTURE_2D, this.targetTexture, 0);

    // Crear depth buffer del mismo tamaño de la textura
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.db);
  }

  animate() {
    var then = 0;

    const render = async (now: number) => {
      now *= 0.001;
      const deltaTime = now - then;
      then = now;

      const depFu = this.gl.LESS;

      this.resize();
      this.gl.clearDepth(1.0);
      this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
      this.gl.enable(this.gl.CULL_FACE);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.depthFunc(depFu);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      if(this.idEscena==2){
        if(!this.drag){
          this.angle.x=0;
          this.angle.y=0;
          this.rot_vel=0.25;
        }
        this.motor.escena.rotar([this.angle.y,this.angle.x+this.rot_vel,0]);
      }

      if(this.idEscena == 10) {

        if(!this.mouseMoved && this.mouseStartedMoving) {
          this.traslacionEscena = 0;
          this.mouseStartedMoving = false;
        }
        this.mouseMoved = false;

        if(this.drag) {
          this.motor.trasladarEscena(this.traslacionEscena, this.limitePosMayor, this.limitePosMenor);
        }
      }

      if(this.idEscena==1 || this.idEscena==10){
        this.gl.disable(this.gl.BLEND); //transparencia porque se necesita el A para el id
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fb);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        this.gl.clearDepth(1.0);
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(depFu);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        await this.motor.dibujarEscena(this.gl, deltaTime, true);

        this.gl.flush(); //envia comandos a la GPU
        this.gl.finish(); //espera que se ejecuten los comandos
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1); //memoria

        //leer pixel
        const pixelX = this.mouse.lastX * this.gl.canvas.width / this.gl.canvas.clientWidth;
        const pixelY = this.gl.canvas.height - this.mouse.lastY * this.gl.canvas.height / this.gl.canvas.clientHeight - 1;
        const data = new Uint8Array(4);
        this.gl.readPixels(pixelX,pixelY,1,1,this.gl.RGBA,this.gl.UNSIGNED_BYTE,data);
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
        let loc = localStorage.getItem('pick');
        if(id>0){
          this.obj_id = id;
          if(parseInt(loc)==this.obj_id)
            document.body.style.cursor = "pointer";
        }
        else{
          this.obj_id = -1;
          document.body.style.cursor = "default";
        }
        this.motor.obj_selec = this.obj_id;

        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);

        // ruido del agua
        this.gl.useProgram(this.motor.watProgInfo.programId);
        this.gl.uniform1f(this.motor.watProgInfo.uniformLocations.lightPosition, then); //u_time
      }

      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

      await this.motor.dibujarEscena(this.gl, deltaTime, false);

      this.frameId = requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  createPerspectiveCamera(){}

  async crearEscenaIslas(){
    //id-> 1
    let modelos: Modelo[] = [
      {
        nombre: 'islaobjetosprueba-textura',
        traslacion: [0, 0.5, 0],
        escalado: [1, 1, 1],
        rotacion: [30, 0, 0],
        pintar: true,
        tipo: 'isla_prueba',
        zoom: -3,
        frame: 0, // frame 0 => Sin animacion con keyframes
      },
    ]

    await this.motor.crearModelos(modelos, this.gl);
  }

  createDirectionalLight(){}

  crearEscenaInicio(){
    //id-> 2
    let modelos: Modelo[] = [
      {
        nombre: 'mundo',
        traslacion: [0,0,0],
        escalado: [1,1,1],
        rotacion: [0,0,0],
        tipo: 'mundo',
        pintar: true,
        zoom: -50,
        frame: 0,
      }
    ]

    this.motor.crearModelos(modelos, this.gl);
  }

  crearEscenaMenu(){}

  crearEscenaComidas(){}

  crearEscenaPrueba(modelos: any){
    this.motor.crearModelos(modelos, this.gl);
  }

  render(){}

  resize() {
    const dpr = window.devicePixelRatio;
    const { width, height } = this.canvas.getBoundingClientRect();
    const displayWidth  = Math.round(width * dpr);
    const displayHeight = Math.round(height * dpr);

    // Si el canvas no tiene el mismo tamaño
    if ((this.canvas.width != displayWidth || this.canvas.height != displayHeight) && displayWidth>0) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      if(this.idEscena != 2) this.motor.actualizarCamara(this.gl);
      if(this.idEscena==1 || this.idEscena==10)
        this.setFramebufferAttachmentSizes(this.canvas.width, this.canvas.height);
    }
  }

  destruirControles(){}

  cambiarCamaraAParalela() {
    this.motor.cambiarCamaraAParalela(this.gl);
  }

  zoomIsla(traslacion: vec3, escalado: vec3, rotacion: vec3) {
    this.motor.zoomIsla(this.gl, traslacion, escalado, rotacion);
  }

  trasladarEscena(traslacion: number, limiteMayor: number, limiteMenor: number) {
    this.motor.trasladarEscena(traslacion, limiteMayor, limiteMenor);
  }

  setTraslacionEscena(traslacion: vec3) {
    this.motor.setTraslacionEscena(traslacion);
  }

  setLimitePosMayor(limite: number) {
    this.limitePosMayor = limite;
  }

  setLimitePosMenor(limite: number) {
    this.limitePosMenor = limite;
  }

  mostrarAnimacion(tipoAnimacion: string) {
    this.motor.mostrarAnimacion(tipoAnimacion);
  }

  trasladarLuz(traslacionLuz: vec3) {
    this.motor.trasladarLuz(traslacionLuz);
  }

  cancelarAnimacionFrame() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  actualizarControles(){}

  eventosMouse(){
    this.canvas.addEventListener("mousedown", this.mouseDown, false);
    this.canvas.addEventListener("mouseup", this.mouseUp, false);
    this.canvas.addEventListener("mouseout", this.mouseUp, false);
    this.canvas.addEventListener("mousemove", this.mouseMove, false);
  }

  mouseDown(e:MouseEvent){
    let x = e.clientX;
    let y = e.clientY;

    let rect = this.canvas.getBoundingClientRect();

    if(rect.left<= x && x < rect.right && rect.top <= y && y<rect.bottom){
      this.mouse.lastX = x;
      this.mouse.lastY = y;
      this.drag = true;
      this.rot_vel=0;
      e.preventDefault();
    }

    let loc = localStorage.getItem('pick');
    if((this.idEscena==1 || this.idEscena==10) && this.obj_id>0 && parseInt(loc)==this.obj_id){
      localStorage.setItem('dia', this.motor.dia);
      this.controlEventosService.mostrarModal(true);
    }

  }

  mouseUp(){
    this.drag = false;
  }

  mouseMove(e:MouseEvent){
    let x = e.clientX;
    let y = e.clientY;

    if(this.drag){
      this.mouseStartedMoving = true;
      this.mouseMoved = true;

      let factorx = 10/this.canvas.width;
      let factory = 10/this.canvas.height;
      let dx = factorx * 2 * (x - this.mouse.lastX);
      let dy = factory * 2 * (y - this.mouse.lastY);

      this.angle.x += dx;
      this.angle.y += dy;

      // Arrastrar Escena
      let factorx2 = 2/this.canvas.width;
      let dx2 = factorx2 * (x - this.mouse.lastX);
      this.traslacionEscena += dx2;

      this.mouse.lastX = x;
      this.mouse.lastY = y;

      e.preventDefault();
    }

    if(this.idEscena==1 || this.idEscena==10){
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.lastX = x - rect.left;
      this.mouse.lastY = y - rect.top;
    }

  }


  private initWebGL(canvas: HTMLCanvasElement): any {
    let gl = null;

    try {
      // Tratar de tomar el contexto estandar. Si falla, retornar al experimental.
      gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch(e) {}

    // Si no tenemos ningun contexto GL, el navegador no lo soporta
    if (!gl) {
      alert("Imposible inicializar WebGL. Tu navegador no puede soportarlo.");
      gl = null;
    }

    return gl;
  }

}
