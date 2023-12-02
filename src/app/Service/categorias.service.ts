import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private url = environment.url;
  constructor(private HttpClient: HttpClient) {}

  obtenerProducto(): Observable<any[]> {
    return this.HttpClient.get<any[]>(this.url + '/categorias');
  }
}
