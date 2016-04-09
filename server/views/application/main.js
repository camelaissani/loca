LOCA.now = new Date();
LOCA.currentMonth = LOCA.now.getMonth() + 1;
LOCA.currentYear = LOCA.now.getFullYear();

(function($, moment, i18next) {
    function applicationReady() {
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
    }

    document.addEventListener('languageChanged', function(/*event*/) {
        LOCA.updateLanguageScript(LOCA.countryCode, 'moment-language', '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/locale/' + LOCA.countryCode + '.js', function() {
            LOCA.updateLanguageScript(LOCA.countryCode, 'jquery-validate-language', '//ajax.aspnetcdn.com/ajax/jquery.validate/1.13.1/localization/messages_' + LOCA.countryCode + '.js', function() {
                LOCA.updateLanguageScript(LOCA.countryCode, 'bootstrap-datepicker-language', '/bower_components/bootstrap-datepicker/dist/locales/bootstrap-datepicker.' + LOCA.countryCode + '.min.js', function() {
                    moment.locale(LOCA.countryCode);
                    applicationReady();
                });
            });
        });
    });
})(window.$, window.moment, window.i18next);
