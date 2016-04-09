'use strict';
var LOCA = {};
LOCA.routes = {};

LOCA.updateLanguageScript = function(lang, id, src, callback) {
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
            fileref.onreadystatechange = fileref.onload = function() {
                if (!fileref.readyState || /loaded|complete/.test(fileref.readyState)) {
                    callback();
                }
            };
        }
        document.getElementsByTagName('head')[0].appendChild(fileref);
    }
};

(function($, i18next) {
    
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
            document.dispatchEvent(new CustomEvent('languageChanged'));
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