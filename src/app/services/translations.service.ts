import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class TranslationsService {

    readonly TRANSLATION = 'translations';
    readonly COLUMNS = 'columns';

    constructor() {}

    getTranslations(): {[key: string]: string}[] {
        return JSON.parse(localStorage.getItem(this.TRANSLATION) || '{}');
    }

    saveTranslations(translations: {[key: string]: string}[]) {
        localStorage.setItem(this.TRANSLATION, JSON.stringify(translations));
    }

    removeTranslations() {
        localStorage.removeItem(this.TRANSLATION);
    }

    isTranslationEmpty() {
        return Object.keys(this.getTranslations()).length === 0
    }

    getColumns(): {[key: string]: string}[] {
        return JSON.parse(localStorage.getItem(this.COLUMNS) || '{}');
    }

    saveColumns(translations: {[key: string]: string}[]) {
        localStorage.setItem(this.COLUMNS, JSON.stringify(translations));
    }

    isColumnEmpty() {
        return Object.keys(this.getColumns()).length === 0
    }

}
