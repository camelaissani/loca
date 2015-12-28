LOCA.now = new Date();
LOCA.currentMonth = LOCA.now.getMonth() + 1;
LOCA.currentYear = LOCA.now.getFullYear();

(function($, moment) {
    // Init locale
    moment.locale('fr');

    $(document).ready(function() {
        var viewId = LOCA.application.getViewFromQueryString(window.location);
        var $demoPopover = $('#demo-popover');
        LOCA.application.updateData(viewId, function() {
            if ($demoPopover.length) {
                window.bootbox.alert( { message: 'Les données du site sont réinitialisées toutes les 30 minutes.',
                                        title: 'Avertissement'} );
            }
        });
    });

})(window.$, window.moment);
