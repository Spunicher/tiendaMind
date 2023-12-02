import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TiendaComponent } from './tienda/tienda/tienda.component';
import { MenuComponent } from './menu/menu/menu.component';
import { LogosComponent } from './logos/logos/logos.component';
import { AcercaComponent } from './acerca/acerca.component';
import { ContactosComponent } from './contactos/contactos.component';


@NgModule({
  imports: [
    RouterModule.forRoot([
        {
            path: 'Tienda', component: TiendaComponent, 
        },

        {
          path: 'Camisa3d/:id', component: TiendaComponent, 
        },

        {
          path: 'acerca', component: AcercaComponent, 
        },

        {
          path: 'contacto', component: ContactosComponent, 
        },

        {
          path: 'Menu', component: MenuComponent, 
        },
        {
          path: 'Logos', component: LogosComponent, 
        },
        {
          path: '', component: MenuComponent, 
        },
    ], {scrollPositionRestoration: 'enabled'})
],
  exports: [RouterModule]
})
export class AppRoutingModule { }
