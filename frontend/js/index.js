import $ from 'jquery';
import i18next from 'i18next';
import bootbox from 'bootbox';
import application from './application';
import FV from './formvalidators';
import language from './language';
import menu from './menu';
import ConnectionMiddleware from './connection_middleware';
import WebsiteMiddleware from './website/middleware';
import SignupMiddleware from './signup/middleware';
import LoginMiddleware from './login/middleware';
import BaseViewMiddleware from './baseview_middleware';
import DashboardMiddleware from './dashboard/middleware';
import RentMiddleware from './rent/middleware';
import OccupantMiddleware from './occupant/middleware';
import PropertyMiddleware from './property/middleware';
import AccountingMiddleware from './accounting/middleware';
import OwnerMiddleware from './owner/middleware';
import SelectRealmMiddleware from './selectrealm/middleware';

const LOCA = application.get('LOCA');

///////////////////////////////////////////////////////////////////////////////
// routes
///////////////////////////////////////////////////////////////////////////////
application.get(new ConnectionMiddleware());

const websiteMiddleware = new WebsiteMiddleware();
application.get(/^\/$/, websiteMiddleware);
application.get('/website', websiteMiddleware);

const loginMiddleware = new LoginMiddleware();
application.get('/login', loginMiddleware);

const signupMiddleware = new SignupMiddleware();
application.get('/signup', signupMiddleware);

application.get(/^\/view\/|^\/page\//, new BaseViewMiddleware());

application.get(/^\/view\/dashboard$|^\/page\/dashboard$/, new DashboardMiddleware());

application.get(/^\/view\/rent$|^\/page\/rent$/, new RentMiddleware());

application.get(/^\/view\/occupant$|^\/page\/occupant$/, new OccupantMiddleware());

application.get(/^\/view\/property$|^\/page\/property$/, new PropertyMiddleware());

application.get(/^\/view\/accounting$|^\/page\/accounting$/, new AccountingMiddleware());

application.get(/^\/view\/selectrealm$|^\/page\/selectrealm$/, new SelectRealmMiddleware());

application.get(/^\/view\/owner$|^\/page\/owner$/, new OwnerMiddleware());

///////////////////////////////////////////////////////////////////////////////
// launch application
///////////////////////////////////////////////////////////////////////////////
language(LOCA.countryCode, (countryCode) => {
    LOCA.countryCode = countryCode;
    application.listen();

    // init form validators
    FV();

    // init menu
    menu();

    // display reset data message
    const $demoPopover = $('#demo-popover');
    if ($demoPopover.length) {
        bootbox.alert({
            message: i18next.t('Site data is reset every 30 minutes'),
            title: i18next.t('Caution')
        });
    }
});
