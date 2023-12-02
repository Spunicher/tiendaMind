import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LogsService } from 'src/app/Service/logs.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-logos',
  templateUrl: './logos.component.html',
  styleUrls: ['./logos.component.css']
})
export class LogosComponent implements OnInit {
  logos: any[] = [];
  logoForm: FormGroup;
  archivo:File = new File([], '');

  constructor(
    private _builder: FormBuilder,
    private logoService: LogsService,
  ){
    this.logoForm = this._builder.group({
      tipo: ['', Validators.required],
      url: ['', Validators.required]
    });
  };

  ngOnInit(): void {
    this.MostrarLogos();
  }

  MostrarLogos(){
    this.logoService.obtenerLogos().subscribe({
      next: (r) => {  
        r.forEach(ee=>{
          ee.url = "https://tienda-mind-api.onrender.com"+ee.url
        })     
        this.logos = r;
      },
      error: (e) => {console.log(e)},
      complete: () => {}
    })
  }

  obtenerImagen(event: any){
   this.archivo = event.target.files[0];
  }
  
  guardarLogos(){
    const formData = new FormData();
    formData.append('url', this.archivo);
    formData.append('tipo', this.logoForm.get('tipo')?.value);

    this.logoService.guardarLogo(formData).subscribe({
      next: (r) => {},
      error: (e) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrio un erro al guardar el logo!"
        });
      },
      complete: () => {
        this.MostrarLogos();
        Swal.fire({
          icon: "success",
          title: "Guardado",
          text: "El logo se guardo de manera correcta!"
        });
      },
    })
  }
 
}
