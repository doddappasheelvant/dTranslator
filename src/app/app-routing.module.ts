import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransTabComponent } from './components/trans-tab/trans-tab.component';

const routes: Routes = [
  {path:"",component:TransTabComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
