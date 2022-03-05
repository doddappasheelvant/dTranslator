import { Component, OnInit } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { setTransTabData, getJsonData, getLanguageLabel } from './trans-tab.factory';
import { Table } from 'primeng/table';
import { languageList } from '../../constants/languageList'
import { TranslationsService } from 'src/app/services/translations.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GoogleTranslationService } from 'src/app/services/google-translation.service';

@Component({
  selector: 'trans-tab',
  templateUrl: './trans-tab.component.html',
  styleUrls: ['./trans-tab.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class TransTabComponent implements OnInit {

  translations: { [key: string]: any }[] = [];
  cols: { [key: string]: string }[] = [];
  globalFilterKeys: string[] = [];
  totalRecords: number = 0;
  clonedTranslation: { [s: string]: {} } = {};
  selectedLanguage: { [key: string]: any } = {};
  languageList: { [key: string]: any }[] = languageList;
  filterText: string = '';
  maxCollimt: number = 8000;
  fileBuffer: File | undefined;
  selectedRows: { [key: string]: any }[] = [];
  selectedValues: { [key: string]: string }[] = [];
  translationDialog: boolean = false;
  newRow: any = {};
  submitted: boolean = false;
  editFlag: boolean = false;
  editRowData: any = {};

  constructor(private translationsService: TranslationsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private gts: GoogleTranslationService) { }

  ngOnInit(): void {
    this.cols = [
      { field: 'keyword', header: 'Keyword' },
      { field: 'en-us', header: 'English (United States)' },
      { field: 'status', header: 'Status' }
    ];
    if (!this.translationsService.isColumnEmpty()) {
      this.cols = this.translationsService.getColumns()
    }

    if (!this.translationsService.isTranslationEmpty()) {
      this.translations = this.translationsService.getTranslations()
      this.globalFilterKeys = Object.keys(this.translations[0])
    }
  }

  exportJSON() {
    this.cols.slice(1, this.cols.length - 1).forEach((col) => {
      const fileName = 'strings.' + col.field + '.json';
      const jsonData = getJsonData(this.selectedRows.length > 0 ? this.selectedRows : this.translations, col.field);
      const data: Blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      FileSaver.saveAs(data, fileName)
    })
  }

  exportExcel() {
    const fileName = 'language_translations.xlsx';
    let excelData = this.translations.map((translationObj) => {
      delete translationObj.status
      return translationObj
    })
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const workbook: XLSX.WorkBook = {
      Sheets: {
        data: worksheet
      },
      SheetNames: ["data"]
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });
    const EXCEL_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'";
    const data: Blob = new Blob([excelBuffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName);
  }

  onFileUpload(event: File[], langLabel: string, headeFileUpload: any) {
    this.fileBuffer = event[0]
    let langCode: string = languageList.find((language) => { return language.label === langLabel })?.key || 'en-us';
    this.fileBuffer.arrayBuffer().then((buffer: any) => {
      let fileData: any = JSON.parse(new TextDecoder().decode(buffer))
      let keyExists = this.translations.find(translation => fileData[translation.keyword] != undefined && translation[langCode] != undefined)
      if (keyExists) {
        this.confirmationService.confirm({
          message: 'Are you sure you want to override the ' + langLabel + ' file?',
          header: 'Confirm',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: `${langLabel} file replaced`, life: 5000 });
            this.setTranslationData(this.translations, langCode, fileData)
          }
        });
      } else {
        this.setTranslationData(this.translations, langCode, fileData)
      }
    })
    headeFileUpload.clear();
  }

  setTranslationData(translations: { [key: string]: string }[], languageCode: string, jsonFileData: { [key: string]: string }) {
    setTransTabData(this.translations, languageCode, jsonFileData)
    this.globalFilterKeys = Object.keys(this.translations[0])
    this.totalRecords = Math.max(this.translations.length, this.totalRecords);
    this.translationsService.saveTranslations(this.translations)
    this.translations = [...this.translations];
  }

  clear(table: Table, e: any) {
    table.clear();
    this.filterText = ''
  }

  onRowEditInit(product: any) {
    this.clonedTranslation[product.id] = { ...product };
  }

  onRowEditSave(product: any) {
    this.clonedTranslation[product.id];
    this.translationsService.saveTranslations(this.translations);
  }

  onRowEditCancel(product: any, index: number) {
    this.translations[index] = this.clonedTranslation[product.id];
    delete this.clonedTranslation[product.id];
  }

  /**
   * Add a new column for language
   */
  addColumn() {

    let colAlreadyExists = this.cols.find(col => col.field === this.selectedLanguage.key)

    if (!colAlreadyExists) {
      this.cols.splice(-1, 0, {
        field: languageList.find((language) => { return language.label === this.selectedLanguage.label })?.key || 'en-us',
        header: this.selectedLanguage.label
      })
      this.translationsService.saveColumns(this.cols)
    } else {
      let errMsg = `${this.selectedLanguage.label} is already Added`
      this.messageService.add({ severity: 'error', summary: 'Error', detail: errMsg });
    }
  }

  deleteMultipleRows() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected rows?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: `rows deleted`, life: 5000 });
        let keys: string[] = this.selectedRows.map((language) => language.keyword);
        this.translations = this.translations.filter(function (translation) {
          return !keys.includes(translation.keyword)
        });
        this.translationsService.saveTranslations(this.translations);
        this.totalRecords = this.translations.length;
        this.selectedRows = []
      }
    });
  }

  handleChange() {
    this.translationsService.saveTranslations(this.translations);
  }

  deleteColumn(language: { [key: string]: string }) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + language.header + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: `${language.header} deleted`, life: 5000 });
        this.translations.forEach(translation => {
          delete translation[language.field];
        })
        this.translationsService.saveTranslations(this.translations);
        this.cols = this.cols.filter(column => {
          return column.field !== language.field
        })
        this.translationsService.saveColumns(this.cols)
      }
    });
  }

  getTranslatedData(rowData: any) {
    console.log(rowData)
    console.log('RowID:', rowData.keyword)
    let translationText = rowData['en-us'];
    console.log()

    let langList = this.cols.map(el => el.field).filter(el => (el != 'en-us' && el != 'keyword' && el != 'status'))
    console.log(langList);

    langList.forEach(lang => {
      this.gts.getTranslation(translationText, lang).then((el => {
        console.log('Final Translation:', el);
        this.translations.forEach(tr => {
          if (tr.keyword == rowData.keyword) {
            tr[lang] = el
          }
        })

        this.translationsService.saveTranslations(this.translations);
      })).catch(err => console.log('Error:--', err));
    })
  }
  newRowAdd() {
    this.submitted = false;
    this.translationDialog = true;
  }

  saveRow() {
    this.submitted = true;
    if (this.newRow.keyword && this.newRow['en-us']) {
      this.translations.splice(0, 0, this.newRow);
      this.translationsService.saveTranslations(this.translations);
      this.translationDialog = false;
      this.newRow = {};
    }
  }

  hideDialog() {
    this.translationDialog = false;
    this.submitted = false;
  }

  showEditDialog(value: any, field: string) {
    this.editFlag = true;
    this.editRowData['data'] = value;
    this.editRowData['field'] = field;
    this.editRowData['value'] = value[field];
    this.editRowData['header'] = getLanguageLabel([field])[0]?.label;
  }

  editRowSave() {
    this.editFlag = false;
    this.editRowData['data'][this.editRowData['field']] = this.editRowData['value'];
    this.editRowData = {};
  }

  editRowCancel() {
    this.editFlag = false;
    this.editRowData = {};
  }

  multiApprove() {
    let keys: string[] = this.selectedRows.map((language) => language.keyword);
    this.translations = this.translations.map(function (translation) {
      if (keys.includes(translation.keyword)) {
        translation.status = true
      }
      return translation
    });
    this.translationsService.saveTranslations(this.translations);
  }
}
