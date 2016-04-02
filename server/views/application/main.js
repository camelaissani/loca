LOCA.now = new Date();
LOCA.currentMonth = LOCA.now.getMonth() + 1;
LOCA.currentYear = LOCA.now.getFullYear();

(function($, moment, i18next) {

    document.addEventListener('languageChanged', function(/*event*/) {
        moment.locale(LOCA.countryCode);
    });

    document.addEventListener('applicationReady', function(/*event*/) {
        var viewId = LOCA.getViewFromQueryString(window.location);
        var $demoPopover = $('#demo-popover');

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
