import $ from 'jquery';
import frontexpress from 'frontexpress';

class BaseViewMiddleware extends frontexpress.Middleware {
    entered() {
        // hide footer and background image
        $('body').removeClass('covered-body');
        $('body > .footer').hide();
    }
}

export default BaseViewMiddleware;