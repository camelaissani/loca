'use strict';
var LOCA = {};
LOCA.routes = {};

(function($, i18next) {
    function updateLanguageScript(lang, id, src) {
        var fileref = document.getElementById(id);

        if (fileref) {
            document.getElementsByTagName('head')[0].removeChild(fileref);
        }

        if (lang !== 'en') {
            fileref = document.createElement('script');
            fileref.setAttribute('id', id);
            fileref.setAttribute('type', 'text/javascript');
            fileref.setAttribute('src', src);
            document.getElementsByTagName('head')[0].appendChild(fileref);
        }
    }
    
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
                updateLanguageScript(LOCA.countryCode, 'moment-language', '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/locale/' + LOCA.countryCode + '.js');
                updateLanguageScript(LOCA.countryCode, 'jquery-validate-language', '//ajax.aspnetcdn.com/ajax/jquery.validate/1.13.1/localization/messages_' + LOCA.countryCode + '.js');
                updateLanguageScript(LOCA.countryCode, 'bootstrap-datepicker-language', '/bower_components/bootstrap-datepicker/dist/locales/bootstrap-datepicker.' + LOCA.countryCode + '.min.js');
            }
            document.dispatchEvent(new CustomEvent('languageChanged'));
        });

        i18next.on('loaded', function(/*loaded*/) {
            document.dispatchEvent(new CustomEvent('applicationReady', {
                detail: {},
                bubbles: false,
                cancelable: false
            }));
        });
    });

    // Header menu management
    $(document).on('click', '.nav-action', function() {
        var viewId = $(this).data('id');
        LOCA.application.updateView(viewId, null, true);
    });
    $(document).on('click', '.navbar-collapse.collapse.in a:not(.dropdown-toggle)', function() {
        $(this).closest('.navbar-collapse').collapse('hide');
    });
    $(document).on('click', '.navbar-collapse.collapse.in button:not(.navbar-toggle)', function() {
        $(this).closest('.navbar-collapse').collapse('hide');
    });
})(window.$, window.i18next);
