import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ProductosService } from 'src/app/Service/productos.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogsService } from 'src/app/Service/logs.service';
import { CategoriasService } from 'src/app/Service/categorias.service';
import html2canvas from 'html2canvas';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-tienda',
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css'],
})
export class TiendaComponent implements OnInit {
  formGuardarProductos: FormGroup;
  urlpecho: String = '';
  lstMostrarCategorias: any;
  selectCategoria: any;
  archivo: File = new File([], '');
  idActivo: boolean = true;

  constructor(
    private fb: FormBuilder,
    private productosServices: ProductosService,
    private logoServices: LogsService,
    private categoriasServices: CategoriasService,
    private route: ActivatedRoute,
    private routeService: Router,
    private sanitizer: DomSanitizer
  ) {
    this.formGuardarProductos = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagen: [],
      talla: [],
      tela: [],
      existencias: ['', Validators.required],
      precio: [],
      torzoUrl: [],
      hombroUrl: [],
      pechoUrl: [],
      categoria: [],
    });
  }

  shirtMesh: THREE.Mesh | undefined;
  shirtScene: THREE.Scene | undefined;

  lstLogosEspalda: any;
  lstLogoBrazo: any;
  lstLogoPecho: any;
  urllogosBrazoId: any;
  urllogosTorzoId: any;
   urllogosEspaldaId: any;

  renderer = new THREE.WebGLRenderer();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  orbit = new OrbitControls(this.camera, this.renderer.domElement);
  scenePrincipal = new THREE.Scene();
  sceneTorzo = new THREE.Scene();
  sceneHombro = new THREE.Scene();
  sceneEspalda = new THREE.Scene();

  color: string = 'white';

  switchColor(_color: string) {
    this.color = _color;

    // Verifica si la camisa ya se ha cargado y asignado a la variable shirtMesh
    if (this.shirtMesh) {
      // Verifica que el material sea de tipo MeshStandardMaterial
      if (this.shirtMesh.material instanceof THREE.MeshStandardMaterial) {
        if (this.shirtScene) {
          if (this.color == 'rgb(255, 255, 255)') {
            this.shirtScene.background = new THREE.Color('white');
          } else if (this.color == 'rgb(239, 189, 78)') {
            this.shirtScene.background = new THREE.Color('rgb(239, 189, 78)');
          } else if (this.color == 'rgb(128, 198, 112)') {
            this.shirtScene.background = new THREE.Color('rgb(128, 198, 112)');
          } else if (this.color == 'rgb(114, 109, 232)') {
            this.shirtScene.background = new THREE.Color('rgb(114, 109, 232)');
          } else if (this.color == 'rgb(239, 103, 78)') {
            this.shirtScene.background = new THREE.Color('rgb(239, 103, 78)');
          } else if (this.color == 'rgb(53, 57, 52)') {
            this.shirtScene.background = new THREE.Color('rgb(163, 163, 163)');
          }
        }

        this.shirtMesh.material.color.set(new THREE.Color(this.color));
      } else {
        console.error(
          'El material de la camisa no es del tipo esperado (MeshStandardMaterial).'
        );
      }
    }
  }

  obtenerCategorias() {
    this.categoriasServices.obtenerProducto().subscribe({
      next: (r) => {
        const lista: any[] = [];
        r.forEach((e) => {
          if (e.nombre === 'CAMISAS 3D') {
            lista.push(e);
          }
        });
        this.lstMostrarCategorias = lista;
      },
      error: (e) => {},
      complete: () => {},
    });
  }

  obtenerLogoEspalda() {
    this.logoServices.obtenerLogo('Espalda').subscribe((e) => {
      this.lstLogosEspalda = e;
    });
  }

  obtenerLogoHombro() {
    this.logoServices.obtenerLogo('Hombro').subscribe((e) => {
      this.lstLogoBrazo = e;
    });
  }

  obtenerLogoTorzo() {
    this.logoServices.obtenerLogo('Torzo').subscribe((e) => {
      this.lstLogoPecho = e;
    });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  base64toFile2(base64String: string, filename: string): File | null {
    const base64 = base64String.split(';base64,').pop();

    if (!base64) {
      console.error('Formato Base64 incorrecto');
      return null;
    }

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });

    try {
      return new File([blob], filename, { type: blob.type });
    } catch (e) {
      console.error('Error al crear el objeto File:', e);
      return null;
    }
  }

  obtenerUrlLogoTorzoId(id: string) {
    this.logoServices.obtenerLogoId(id).subscribe((e) => {
        this.urllogosTorzoId = e._id;
      const filename = 'imagen.jpg';
      const file = this.base64toFile2(e.url, filename);
      if (file) {
        this.cargarImagenTorzo(file);
      }
    });
  }

  cargarImagenTorzo(file: File) {
    this.sceneTorzo.children.forEach((child) => {
      if (child instanceof THREE.Sprite) {
        this.sceneTorzo.remove(child);
      }
    });
    const imgUrl = URL.createObjectURL(file);
    const loader = new THREE.TextureLoader();
    loader.load(imgUrl, (texture) => {
      // Crear el material
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });
      const geometry = new THREE.PlaneGeometry(11, 8);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 7.4, 7.372);
      this.sceneTorzo.add(mesh);
      this.scenePrincipal.add(this.sceneTorzo);
      URL.revokeObjectURL(imgUrl);
    });
  }

  obtenerUrlLogoEspaldId(id: string) {
    this.logoServices.obtenerLogoId(id).subscribe((e) => {
      this.urllogosEspaldaId = e._id;
      const filename = 'imagen.jpg';
      const file = this.base64toFile2(e.url, filename);
      if (file) {
        this.cargarImagenEspalda(file);
      }
    });
  }

  cargarImagenEspalda(file: File) {
    // Eliminar todas las mallas existentes
    this.sceneEspalda.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        this.sceneEspalda.remove(child);
      }
    });
    const imgUrl = URL.createObjectURL(file);

    const logoTextureEspalda = new THREE.TextureLoader();
    logoTextureEspalda.load(imgUrl, (texture) => {
      const logoMaterialEspalda = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });
      const geometry = new THREE.PlaneGeometry(10, 10);
      const mesh = new THREE.Mesh(geometry, logoMaterialEspalda);
      mesh.rotation.set(Math.PI, 0, 9.4);
      mesh.position.set(0, 10, -8.5);
      this.sceneEspalda.add(mesh);
      this.scenePrincipal.add(this.sceneEspalda);
      URL.revokeObjectURL(imgUrl);
    });
  }

  obtenerUrlLogoHombroId(id: string) {
    this.logoServices.obtenerLogoId(id).subscribe((e) => {
      this.urllogosBrazoId = e._id;
      const filename = 'imagen.jpg';
      const file = this.base64toFile2(e.url, filename);
      if (file) {
        this.cargarImagenHombro(file);
      }
    });
  }

  cargarImagenHombro(file: File) {
    this.sceneHombro.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        this.sceneHombro.remove(child);
      }
    });
    const imgUrl = URL.createObjectURL(file);
    const logoTextureHombro = new THREE.TextureLoader();
    logoTextureHombro.load(imgUrl, (texture) => {
      const logoMaterialHombro = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });
      const geometry = new THREE.PlaneGeometry(5, 4);
      const mesh = new THREE.Mesh(geometry, logoMaterialHombro);
      mesh.position.set(-17, 12.8, -3.5);;
      mesh.rotation.set(Math.PI / 2, 10, 7.9);
      this.sceneHombro.add(mesh);
      this.scenePrincipal.add(this.sceneHombro);
      URL.revokeObjectURL(imgUrl);
    });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  

  cargarImgen3d(loader: GLTFLoader) {
    loader.load(
      '/assets/img/camiseta.glb',
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.position.y = -35;
            child.material.metalness = 0;
            child.material.roughness = 0.5;
            child.material.color.set(new THREE.Color('rgb(250, 243, 243)'));
            this.shirtMesh = child;
          }
        });
        gltf.scene.scale.set(0.5, 0.5, 0.5); //cambia el tamaño de la camisa
        this.scenePrincipal.add(gltf.scene);
      },
      undefined,
      (error) => {
        console.error('Error al cargar el modelo:', error);
      }
    );
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    // Renderiza la escena principal
    this.renderer.render(this.scenePrincipal, this.camera);
  };

  cargarImgen3dAdiv() {
    this.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    document.getElementById('camisa')?.appendChild(this.renderer.domElement);
    this.camera.position.set(0, 10, 28);
    this.orbit.update();
    const directionalLight = new THREE.DirectionalLight(
      new THREE.Color('rgb(255, 255, 255)'),
      0.5
    );
    directionalLight.position.set(0, 1, 0); // Posición de la luz
    this.scenePrincipal.add(directionalLight);
    const ambientLight = new THREE.AmbientLight(
      new THREE.Color('rgb(255, 255, 255)'),
      1.5
    ); // Color blanco, intensidad 0.5
    this.scenePrincipal.add(ambientLight);
    const loader = new GLTFLoader();

    this.cargarImgen3d(loader);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight / 2;

    const gradient = context!.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgb(200, 200, 255)'); // Color intermedio (azul claro)
    gradient.addColorStop(0.5, 'rgb(200, 200, 255)');
    gradient.addColorStop(0.7, 'rgb(244, 244, 244)'); // Color intermedio
    gradient.addColorStop(1, 'rgb(255, 255, 255)');

    context!.fillStyle = gradient;
    context!.fillRect(0, 0, canvas.width, canvas.height);

    // Usamos la textura del canvas como fondo
    const texture = new THREE.CanvasTexture(canvas);
    this.scenePrincipal.background = texture;

    this.shirtScene = this.scenePrincipal;
    this.animate();
  }

  base64toFile(base64String: any, fileName: any, mimeType: any) {
    const [contentType, base64Data] = base64String.split(';base64,');
    const type = mimeType || contentType.split(':')[1];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: type });
    const file = new File([blob], fileName, { type: type });
    return file;
  }

  async captureScreen() {
    this.animate();
    const element = document.getElementById('camisa');
    const canvas = await html2canvas(element!);
    const screenshotURL = canvas.toDataURL();
    const fileName = 'camisa3D.png';
    const mimeType = 'image/png';
    console.log(screenshotURL);
    this.archivo = this.base64toFile(screenshotURL, fileName, mimeType);
  }

  async guardarProducto() {
    await this.captureScreen();
    const formData = new FormData();
    formData.append('nombre', this.formGuardarProductos.get('nombre')?.value);
    formData.append('color', this.color);
    formData.append(
      'descripcion',
      this.formGuardarProductos.get('descripcion')?.value
    );
    formData.append('url', this.archivo);
    formData.append('talla', this.formGuardarProductos.get('talla')?.value);
    formData.append('tela', this.formGuardarProductos.get('tela')?.value);
    formData.append(
      'existencias',
      this.formGuardarProductos.get('existencias')?.value
    );
    formData.append('precio', this.formGuardarProductos.get('precio')?.value);

    formData.append('categorias', this.selectCategoria);


    formData.append('torzoUrl', this.urllogosTorzoId);
    formData.append('hombroUrl', this.urllogosBrazoId);
    formData.append('espaldaUrl', this.urllogosEspaldaId);
    this.productosServices.guardarProducto(formData).subscribe({
      next: (r) => {},
      error: (e) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrio un erro al guardar el producto!',
        });
      },
      complete: () => {
        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: 'El producto se guardo de manera correcta!',
        });
        this.routeService.navigate(['/Menu']);
      },
    });
  }

  mostrarCamisa3dPorId() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.productosServices.obtenerProductoById(id!).subscribe({
        next: (r) => {
          this.obtenerUrlLogoTorzoId(r.torzoUrl);
          this.obtenerUrlLogoHombroId(r.hombroUrl);
          this.obtenerUrlLogoEspaldId(r.espaldaUrl);
          if (this.shirtMesh) {
            if (this.shirtMesh.material instanceof THREE.MeshStandardMaterial) {
              if (this.shirtScene) {
                this.shirtMesh.material.color.set(new THREE.Color(r.color));
              }
            }
          }

          this.formGuardarProductos.patchValue({
            nombre: r.nombre,
            categoria: r.categorias._id,
            tela: r.tela,
            talla: r.talla,
            descripcion: r.descripcion,
            existencias: r.existencias,
            precio: r.precio,
          });
          this.idActivo = false;
        },
        error: (e) => {
          console.log(e);
        },
        complete: () => {},
      });
    });
  }

  eliminarProducto() {
    Swal.fire({
      title: '¿Desea eliminar este producto?',
      showDenyButton: true,
      confirmButtonText: 'Si',
      denyButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.route.paramMap.subscribe((params) => {
          const id = params.get('id');
          this.productosServices.eliminarProductoById(id!).subscribe({
            next: (r) => {},
            error: (e) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrio un erro al guardar el logo!',
              });
            },
            complete: () => {
              Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El producto se ha eliminado satisfactoriamente!',
              });
              this.routeService.navigate(['/Menu']);
            },
          });
        });
      } else if (result.isDenied) {
        Swal.fire({
          icon: 'info',
          title: 'Operacion cancelada',
          text: 'El usuario cancelo la eliminacion del producto',
        });
      }
    });
  }

  ngOnInit() {
    this.cargarImgen3dAdiv();
    this.mostrarCamisa3dPorId();
    this.obtenerLogoEspalda();
    this.obtenerLogoHombro();
    this.obtenerLogoTorzo();
    this.obtenerCategorias();
  }
}
