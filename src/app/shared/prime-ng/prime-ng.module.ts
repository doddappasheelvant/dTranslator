import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';

const primeNgModules = [
  ButtonModule,
  TableModule,
  FileUploadModule,
  ToastModule,
  ConfirmDialogModule,
  DropdownModule,
  ToggleButtonModule,
  TooltipModule,
  DialogModule,
  InputTextareaModule
];

@NgModule({
  declarations: [],
  imports: [
    ...primeNgModules
  ],
  exports: [
    ...primeNgModules
  ]
})
export class PrimeNgModule { }
