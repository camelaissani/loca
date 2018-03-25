import $ from 'jquery';
import i18next from 'i18next';
import bootbox from 'bootbox';
import application from './application';
import FV from './formvalidators';
import language from './language';
import menu from './menu';
import ConnectionMiddleware from './connection_middleware';
import MenuMiddleware from './menu_middleware';
import WebsiteMiddleware from './website/middleware';
import SignupMiddleware from './signup/middleware';
import LoginMiddleware from './login/middleware';
import ViewMiddleware from './view_middleware';
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
const connectionMiddleware = new ConnectionMiddleware();
application.get(connectionMiddleware);
application.post(connectionMiddleware);
application.get(new MenuMiddleware());
application.get(/^\/view\//, new ViewMiddleware());
[
    {id: 'website', Middleware: WebsiteMiddleware},
    {id: 'signup', Middleware: SignupMiddleware},
    {id: 'signin', Middleware: LoginMiddleware},
    {id: 'dashboard', Middleware: DashboardMiddleware},
    {id: 'rent', Middleware: RentMiddleware},
    {id: 'occupant', Middleware: OccupantMiddleware},
    {id: 'property', Middleware: PropertyMiddleware},
    {id: 'accounting', Middleware: AccountingMiddleware},
    {id: 'selectrealm', Middleware: SelectRealmMiddleware},
    {id: 'owner', Middleware: OwnerMiddleware},
].forEach(page => {
    const middleware = new page.Middleware();
    application.get(`/${page.id !== 'website' ? page.id : ''}`, middleware);
    application.get(`/view/${page.id}`, middleware);
});

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
