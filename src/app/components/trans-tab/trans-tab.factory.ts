import { languageList } from '../../constants/languageList'
/**
 * Translates the object from the json file to an appropriate one for the UI
 */
export function setTransTabData(translations: { [key: string]: any }[], languageCode: string, jsonFileData: { [key: string]: string }) {
    let transLength: number = translations.length;
    Object.entries(jsonFileData).forEach(([key, value]) => {
        let index: number = -1;
        if(transLength > 0) {
            index = translations.findIndex(translation => translation['keyword'] === key)
        }
        if (index === -1) {
            translations.push({
                keyword: key,
                [languageCode]: value,
                status: false
            })
        } else {
            translations[index][languageCode] = value
        }
    })
}

/**
 * Translates the data back to json format
 */
export function getJsonData(translations: { [key: string]: string }[], languageCode: string): { [key: string]: string } {
    let jsonData: { [key: string]: string } = {};
    translations.forEach((translationObj) => {
        if (jsonData[translationObj.keyword] === undefined) {
            jsonData[translationObj.keyword] = translationObj[languageCode]
        }
    });
    return jsonData;
}

export function getLanguageLabel(langKeyList:string[]){

    let langLabelList = langKeyList.map(langKey=>{
        let langLabel = languageList.find(el=>el.key==langKey)
        return langLabel;
    })
    return langLabelList
}