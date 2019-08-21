import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'registro', loadChildren: './auth/registrar/registrar.module#RegistrarPageModule' },
  { path: 'login', loadChildren: './auth/login/login.module#LoginPageModule' },
  { path: 'caratula', loadChildren: './pantallas/caratula/caratula.module#CaratulaPageModule' },
  { path: 'seleccionar-ubicacion', loadChildren: './pantallas/tareas/seleccionar-ubicacion/seleccionar-ubicacion.module#SeleccionarUbicacionPageModule' },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }