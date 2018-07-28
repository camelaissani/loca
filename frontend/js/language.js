/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

import moment from 'moment';
import i18next from 'i18next';

const LangsForJQueryValidate = {
    'pt': 'pt_PT'
};

async function updateLanguageScript(id, src) {
    let fileref = document.getElementById(id);

    if (fileref) {
        document.getElementsByTagName('head')[0].removeChild(fileref);
    }

    await new Promise((resolve, reject) => {
        try {
            fileref = document.createElement('script');
            fileref.id = id;
            fileref.type = 'text/javascript';
            fileref.async = true;
            fileref.onload = res => {
                if (res.type === 'error') {
                    reject(`an error has occurred when loading the localization file ${src}`);
                } else {
                    resolve(res);
                }
            };
            fileref.onerror = () => {
                reject(`an error has occurred when loading the localization file ${src}`);
            };
            fileref.src = src;
            document.getElementsByTagName('head')[0].appendChild(fileref);
        } catch (error) {
            reject(error);
        }
    });
}

export default (defaultCountryCode, callback) => {
    document.addEventListener('DOMContentLoaded', () => {
        // Init locale
        i18next
            .use(window.i18nextBrowserLanguageDetector)
            .use(window.i18nextLocalStorageCache)
            .use(window.i18nextXHRBackend)
            .use(window.i18nextSprintfPostProcessor)
            .init({
                fallbackLng: 'en',
                debug: false,
                pluralSeparator: '_',
                keySeparator: '::',
                nsSeparator: ':::',
                detection: {
                    order: [ /*'querystring', 'localStorage',*/ 'cookie', 'navigator'],
                    //lookupQuerystring: 'lng',
                    lookupCookie: 'locaI18next',
                    cookieDomain: 'loca',
                    // lookupLocalStorage: 'i18nextLng',
                    caches: [ /*'localStorage', */ 'cookie']
                },
                // cache: {
                //     enabled: false,
                //     prefix: 'i18next_res_',
                //     expirationTime: 7 * 24 * 60 * 60 * 1000
                // },
                backend: {
                    loadPath: '/public/locales/{{lng}}.json',
                    allowMultiLoading: false
                }
            });

        i18next.on('languageChanged', function(countryCode) {
            const splittedCountryCode = (countryCode && countryCode.split('-')) || defaultCountryCode.split('-');
            const lang = splittedCountryCode[0].toLowerCase();
            const langForJQueryValidate = LangsForJQueryValidate[lang] || lang;
            try {
                Promise.all([
                    updateLanguageScript('moment-language', `//cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/locale/${lang}.js`),
                    updateLanguageScript('jquery-validate-language', `//ajax.aspnetcdn.com/ajax/jquery.validate/1.13.1/localization/messages_${langForJQueryValidate}.js`),
                    updateLanguageScript('bootstrap-datepicker-language', `/node_modules/bootstrap-datepicker/dist/locales/bootstrap-datepicker.${lang}.min.js`)
                ]);
            } catch (error) {
                console.error(error);
            }

            moment.locale(lang);
            if (callback) {
                callback(lang);
            }
        });
    });
};
