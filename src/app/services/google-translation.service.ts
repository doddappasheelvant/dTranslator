import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GoogleTranslationService {

  private readonly API_ENDPOINT = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t'

  constructor(private http: HttpClient) { }

  private getFinalApiUrl(data: string, langCode: string) {
    data = encodeURIComponent(data);
    return this.API_ENDPOINT + `&tl=${langCode}&q=${data}`;
  }

  getTranslation(data: string, langCode: string) {

    if (!data) return Promise.reject('Data is Missing')
    if (!langCode) return Promise.reject('Language Code is Missing')

    let url = this.getFinalApiUrl(data, langCode);
    return new Promise((resolve, reject) => {
      this.http.get(url).toPromise()
        .then((el: any) => {
          if (!el[0]) return reject(`Something Went Worng: ${url}`)
          if (el[0][0][0] == el[0][0][1]) return reject(`No Translation Available`)
          return resolve(el[0][0][0])
        }).catch(err => {
          return reject(err)
        })
    })
  }

}
