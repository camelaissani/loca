import $ from 'jquery';
import i18next from 'i18next';
import bootbox from 'bootbox';
import application from '../lib/application';

// routes
import dashboardRoute from './dashboard/route';
import rentRoute from './rent/route';
import occupantRoute from './occupant/route';
import propertyRoute from './property/route';
import ownerRoute from './owner/route';
import accountRoute from './account/route';
import accountingRoute from './accounting/route';
import selectRealmCtrl from './selectrealm/selectrealmctrl';
import logoutCtrl from './login/logoutctrl';

import menu from '../lib/menu';
import main from '../lib/main';

document.addEventListener('applicationReady', function(/*event*/) {

    // init menu
    menu();

    const viewId = application.getViewFromLocation();
    const $demoPopover = $('#demo-popover');

    application.updateData(viewId, function() {
        if ($demoPopover.length) {
            bootbox.alert({
                message: i18next.t('Site data is reset every 30 minutes'),
                title: i18next.t('Caution')
            });
        }
    });
});

dashboardRoute();
rentRoute();
occupantRoute();
propertyRoute();
ownerRoute();
accountRoute();
accountingRoute();
selectRealmCtrl.pageInitialized();
logoutCtrl();

main();
