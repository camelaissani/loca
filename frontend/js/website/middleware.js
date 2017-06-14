import $ from 'jquery';
import BaseViewMiddleware from '../baseview_middleware';

class WebsiteMiddleware extends BaseViewMiddleware {

    // overriden
    entered() {
        // show footer and background image
        $('body').addClass('covered-body');
        $('body > .footer').show();
    }

    // overriden
    exited() {}
}

export default WebsiteMiddleware;
