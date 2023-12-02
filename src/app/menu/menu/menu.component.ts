import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriasService } from 'src/app/Service/categorias.service';
import { ProductosService } from 'src/app/Service/productos.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  productos: any [] = [];
  lstMostrarCategorias: any;
  selectCategoria: any;

  constructor(
    private productoService: ProductosService,
    private categoriasServices: CategoriasService,
    private routeService:Router
  ){}

  ngOnInit(): void {
    this.cargarProductos();
    this.obtenerCategorias();
  }

  cargarProductos(){
    this.productoService.mostrarProductos().subscribe( data => {
      console.log(data)
      data.forEach(e=>{
        e.imagen = "https://tienda-mind-api.onrender.com"+e.imagen
      })
      this.productos = data;
    });
  }
  
  cargarProductosByCategoria(){
    this.productoService.mostrarProductosByCategoria(this.selectCategoria).subscribe( data => {
      this.productos = data;
    });
  }

  obtenerCategorias() {
    this.categoriasServices.obtenerProducto().subscribe({
      next: (r) => {
        this.lstMostrarCategorias = r;
      },
      error: (e) => {},
      complete: () => {},
    });
  }

  mostrarUnProductoById(id:string){
    this.productoService.obtenerProductoById(id).subscribe({
      next: (r) => {
        this.routeService.navigate(['/Camisa3d/'+r._id])
      },
      error: (e) => {
        console.log(e)
      },
      complete: () => {},
    });
  }

  mostrarUnProductoDetalleId(id:string){
    this.productoService.obtenerProductoById(id).subscribe({
      next: (r) => {
        this.routeService.navigate(['/Detalles/'+r._id])
      },
      error: (e) => {
        console.log(e)
      },
      complete: () => {},
    });
  }
}
