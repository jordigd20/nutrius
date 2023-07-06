import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { environment } from 'src/environments/environment';
import { OrbitControls } from 'three-orbitcontrols-ts';
import { vec3 } from 'gl-matrix';

export class ThreeEngine {
  loader!: GLTFLoader;
  textureLoader!: THREE.TextureLoader;
  private escenaId!: number;
  private frameId!: number;
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private light!: THREE.DirectionalLight;
  private boxContainer!: any;

  // Mundo Inicio
  private ambientLight!: THREE.AmbientLight;
  private mundo!: THREE.Object3D;
  private controls!: OrbitControls;

  // Islas
  private isla!: THREE.Object3D;
  private agua!: THREE.Object3D;
  private palmeras!: THREE.Object3D;
  private circulosDias!: THREE.Object3D;
  private avatar!: THREE.Object3D;

  // Menus
  private simboloPuntos!: THREE.Object3D;

  // Comidas
  private camaraComidas!: THREE.OrthographicCamera;
  private emoji_feliz!: THREE.Object3D;
  private emoji_triste!: THREE.Object3D;
  private cube1!: THREE.Mesh;
  private cube2!: THREE.Mesh;
  private cube3!: THREE.Mesh;
  private cube4!: THREE.Mesh;

  constructor() {
    this.loader = new GLTFLoader();
    this.loader.setPath(environment.ruta_motor_assets);
  }

  crearEscena(id: number, canvas: HTMLCanvasElement) {
    this.escenaId = id;
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true, // Suaviza las aristas
      alpha: true, // Background transparente
      canvas: this.canvas,
    });

    var container = this.renderer.domElement.parentElement;
    this.boxContainer = container!.getBoundingClientRect();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if(this.escenaId == 2) {
      this.renderer.setSize(this.boxContainer.width, this.boxContainer.height);
    }

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();

    this.createPerspectiveCamera();

    if(this.escenaId != 2){
      this.createDirectionalLight();
    }

  }

  createPerspectiveCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.set(40, 20, 10);

    if(this.escenaId==4){
      this.camera.position.set(0,0,14);
    }
    if(this.escenaId==2){
      this.camera.aspect = this.boxContainer.width/this.boxContainer.height;
      this.camera.updateProjectionMatrix();
    }

    this.scene.add(this.camera);
  }

  createDirectionalLight() {
    this.light = new THREE.DirectionalLight(0xffffff, 1.5);
    this.light.position.set(30, 20, 0);

    if(this.escenaId==4){
      this.light.position.set(0, 0, 80);
    }

    this.light.castShadow = true;
    this.light.shadow.mapSize.width = 1024;
    this.light.shadow.mapSize.height = 1024;
    this.light.shadow.camera.near = 0.5;
    this.scene.add(this.light);
  }

  async crearEscenaInicio() {
    try {
      this.controls = new OrbitControls(this.camera, this.canvas);
      this.ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      this.scene.add(this.ambientLight);

      this.mundo = await this.cargarModeloMultiple('mundo.glb', true);
      this.scene.add(this.mundo);

      this.camera.lookAt(this.mundo.position);

    } catch (error) {
      console.error(error);
    }
  }

  async crearEscenaIslas() {
    try {
      const [
        islaCargada,
        aguaCargada,
        palmerasCargadas,
        circulosDiasCargados,
        avatarCargado
      ] = await Promise.all([
          await this.cargarModelo('isla.glb', true),
          await this.cargarModelo('fondo_agua.glb', true),
          await this.cargarModeloMultiple('palmera.glb', false),
          await this.cargarModeloMultiple('circulos_dias.glb', true),
          await this.cargarModelo('avatar.glb', false),
      ]);

      this.isla = islaCargada;
      this.agua = aguaCargada;
      this.palmeras = palmerasCargadas;
      this.circulosDias = circulosDiasCargados;
      this.avatar = avatarCargado;

      this.avatar.position.set(8,3.5,16.3);

      this.scene.add(this.isla);
      this.scene.add(this.agua);
      this.scene.add(this.palmeras);
      this.scene.add(this.circulosDias);
      this.scene.add(this.avatar);

      this.camera.lookAt(this.isla.position);

    } catch (error) {
      console.error(error);
    }
  }

  async crearEscenaMenu() {
    try {
      this.camera = new THREE.PerspectiveCamera(
        45,this.canvas.width*2 / this.canvas.height*2, 0.1, 2000
      );
      this.camera.position.set(35, 20, 5);
      this.scene.add(this.camera);

      this.simboloPuntos = await this.cargarModelo('simboloPuntos.glb', true);
      this.simboloPuntos.position.set(30,20,0);
      this.scene.add(this.simboloPuntos);
      this.camera.lookAt(this.simboloPuntos.position);

    } catch (error) {
      console.error(error);
    }
  }

  async crearEscenaComidas() {
    try {
      var points = [];
      points.push( new THREE.Vector3(-100, 12.5, 0), new THREE.Vector3(100, 12.5, 0));
      var geometry = new THREE.BufferGeometry().setFromPoints( points );
      var line = new THREE.Line( geometry,
              new THREE.LineBasicMaterial({
                  color: 0xB2B2B2
              }));
      this.scene.add(line);

      const viewSize = 52;
      this.camaraComidas = new THREE.OrthographicCamera(window.innerWidth / -viewSize, window.innerWidth / viewSize, window.innerHeight / viewSize, window.innerHeight / -viewSize, 1, 1000);
      this.scene.add(this.camaraComidas);
      this.camaraComidas.position.set(0,0,50);

      //Creamos los cubos (boxWidth, boxHeight, boxDepth);
      const box1 = new THREE.BoxGeometry( 7,7,7 );

      //Crear textura con imagen del plato
      const textureLoader = new THREE.TextureLoader();
      const texture1 = new THREE.MeshBasicMaterial( {
        map: textureLoader.load('../assets/img/platos/leche.jpg')
      } );
      const texture2 = new THREE.MeshBasicMaterial({
        map: textureLoader.load('../assets/img/platos/serrano.jpg')
      });
      const texture3 = new THREE.MeshBasicMaterial({
        map: textureLoader.load('../assets/img/platos/platano.jpg')
      });

      this.cube1 = new THREE.Mesh( box1, texture1 );
      this.cube1.position.x = -22; //Misma posicion que la camara
      this.cube1.position.y = 7; //Misma posicion que la camara
      this.cube1.rotation.x = 0.15;

      this.cube2 = new THREE.Mesh(box1, texture2);
      this.cube2.position.y = 7;
      this.cube2.rotation.x = 0.15;

      this.cube3 = new THREE.Mesh(box1, texture3);
      this.cube3.position.x = 21;
      this.cube3.position.y = 7;
      this.cube3.rotation.x = 0.15;

      const [
        emoji_feliz1,
        emoji_feliz2,
        emoji_feliz3,
        emoji_triste1,
        emoji_triste2,
        emoji_triste3,
      ] = await Promise.all([
          await this.cargarModelo('sonriente.glb', true),
          await this.cargarModelo('sonriente.glb', true),
          await this.cargarModelo('sonriente.glb', true),
          await this.cargarModelo('triste.glb', true),
          await this.cargarModelo('triste.glb', true),
          await this.cargarModelo('triste.glb', true),
      ]);

      this.emoji_feliz = emoji_feliz1;
      this.emoji_feliz.position.x = -2;
      this.emoji_feliz.position.y = -3;
      this.emoji_feliz.scale.set(0.5, 0.5, 0.5);

      emoji_feliz2.position.x = -24;
      emoji_feliz2.position.y = -3;
      emoji_feliz2.scale.set(0.5, 0.5, 0.5);

      emoji_feliz3.position.x = 19;
      emoji_feliz3.position.y = -3;
      emoji_feliz3.scale.set(0.5, 0.5, 0.5);

      this.emoji_triste = emoji_triste1;
      this.emoji_triste.position.x = 2;
      this.emoji_triste.position.y = -3;
      this.emoji_triste.scale.set(0.5, 0.5, 0.5);

      emoji_triste2.position.x = -20;
      emoji_triste2.position.y = -3;
      emoji_triste2.scale.set(0.5, 0.5, 0.5);

      emoji_triste3.position.x = 23;
      emoji_triste3.position.y = -3;
      emoji_triste3.scale.set(0.5, 0.5, 0.5);

      this.scene.add(this.emoji_feliz);
      this.scene.add(emoji_feliz2);
      this.scene.add(emoji_feliz3);
      this.scene.add(this.emoji_triste);
      this.scene.add(emoji_triste2);
      this.scene.add(emoji_triste3);
      this.scene.add(this.cube1);
      this.scene.add(this.cube2);
      this.scene.add(this.cube3);

    } catch (error) {
      console.error(error);
    }
  }

  async crearEscenaPrueba(){
    try{

    }catch(error){
      console.error(error)
    }
  }

  async cargarModelo(path: string, recieveShadow: boolean): Promise<THREE.Object3D> {

    const objectData = await this.loader.loadAsync(path);

    objectData.scene.traverse( child => {
      if (child instanceof THREE.Mesh) {
        if (recieveShadow)
          child.receiveShadow = true;
        else
          child.castShadow = true;
      }
    });

    const modelo = new THREE.Object3D();
    modelo.add(objectData.scene.children[0]);

    return modelo;
  }

  async cargarModeloMultiple(path: string, recieveShadow: boolean): Promise<THREE.Object3D> {

    const objectData = await this.loader.loadAsync(path);

    objectData.scene.traverse( child => {
      if (child instanceof THREE.Mesh) {
        if (recieveShadow)
          child.receiveShadow = true;
        else
          child.castShadow = true;
      }
    });

    const modelo = new THREE.Object3D();
    modelo.add(objectData.scene);

    return modelo;
  }

  render() {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    if(this.escenaId==4){
      this.cube1.rotation.y += 0.01;
      this.cube2.rotation.y += 0.01;
      this.cube3.rotation.y += 0.01;

      this.renderer.render(this.scene, this.camaraComidas);
    }else{
      this.renderer.render(this.scene, this.camera);
    }
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  cambiarCamaraAParalela() {}
  zoomIsla(traslacion: any, escalado: any, rotacion: any) {}
  trasladarEscena(traslacion: number, limiteMayor: number, limiteMenor: number) {}
  setTraslacionEscena(traslacion: vec3) {}
  setLimitePosMayor(limite: number) {}
  setLimitePosMenor(limite: number) {}
  mostrarAnimacion(tipoAnimacion: string) {}
  trasladarLuz(traslacionLuz: vec3) {}

  actualizarControles() {
    this.controls.update();
  }

  destruirControles() {
    this.controls.dispose();
  }

  cancelarAnimacionFrame() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }
}
