(function($, i18next) {
    function applicationReady(/*event*/) {
        $('#printbutton').click(function() {
            var error = false;
            $('[contenteditable]').each(function() {
                if ($(this).html().replace(/&nbsp;/g, '').replace(' ', '').length === 0) {
                    $(this).addClass('error');
                    error = true;
                }
                else {
                    $(this).removeClass('error');
                }
            });
            if (error) {
                window.alert(i18next.t('Fill the empty fields before printing the document'));
            }
            else {
                window.print();
            }
        });
    }

    document.addEventListener('languageChanged', function(/*event*/) {
        LOCA.updateLanguageScript(LOCA.countryCode, 'jquery-validate-language', '//ajax.aspnetcdn.com/ajax/jquery.validate/1.13.1/localization/messages_' + LOCA.countryCode + '.js', function() {
            applicationReady();
        });
    });

})(window.$, window.i18next);

