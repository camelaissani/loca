LOCA.now = new Date();
LOCA.currentMonth = LOCA.now.getMonth() + 1;
LOCA.currentYear = LOCA.now.getFullYear();

(function($, moment, i18next) {

    i18next.on('languageChanged', function(lng) {
        var splitedLanguage = lng.split('-');
        moment.locale(splitedLanguage[0]);
    });

    document.addEventListener('applicationReady', function(/*event*/) {
        var splitedLanguage = i18next.language.split('-');
        var viewId = LOCA.application.getViewFromQueryString(window.location);
        var $demoPopover = $('#demo-popover');

        moment.locale(splitedLanguage[0]);
        LOCA.application.updateData(viewId, function() {
            if ($demoPopover.length) {
                window.bootbox.alert({
                    message: i18next.t('Site data is reset every 30 minutes'),
                    title: i18next.t('Caution')
                });
            }
        });
    });

})(window.$, window.moment, window.i18next);
