import $ from 'jquery';
import moment from 'moment';
import i18next from 'i18next';
import {LOCA} from '../application/main';


function updateLanguageScript(lang, id, src, callback) {
    var fileref = document.getElementById(id);

    if (fileref) {
        document.getElementsByTagName('head')[0].removeChild(fileref);
    }

    if (lang !== 'en') {
        fileref = document.createElement('script');
        fileref.setAttribute('id', id);
        fileref.setAttribute('type', 'text/javascript');
        fileref.setAttribute('src', src);
        if (callback) {
            fileref.async = true;
            fileref.onreadystatechange = fileref.onload = () => {
                if (!fileref.readyState || /loaded|complete/.test(fileref.readyState)) {
                    callback();
                }
            };
        }
        document.getElementsByTagName('head')[0].appendChild(fileref);
    }
    else if (callback) {
        callback();
    }
}

export default () => {
    $(document).ready(function() {
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

        i18next.on('languageChanged', function(lng) {
            var splitedLanguage = lng.split('-');
            if (splitedLanguage && splitedLanguage.length >0) {
                LOCA.countryCode = splitedLanguage[0].toLowerCase();
            }

            updateLanguageScript(LOCA.countryCode, 'moment-language', '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/locale/' + LOCA.countryCode + '.js', function() {
                updateLanguageScript(LOCA.countryCode, 'jquery-validate-language', '//ajax.aspnetcdn.com/ajax/jquery.validate/1.13.1/localization/messages_' + LOCA.countryCode + '.js', function() {
                    updateLanguageScript(LOCA.countryCode, 'bootstrap-datepicker-language', '/node_modules/bootstrap-datepicker/dist/locales/bootstrap-datepicker.' + LOCA.countryCode + '.min.js', function() {
                        moment.locale(LOCA.countryCode);
                        document.dispatchEvent(new CustomEvent('applicationReady', {
                            'bubbles': true,
                            'cancelable': false
                        }));
                    });
                });
            });
        });
    });
};
