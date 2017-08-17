import $ from 'jquery';
import frontexpress from 'frontexpress';

class WebsiteMiddleware extends frontexpress.Middleware {

    // overriden
    entered() {
        $('body').addClass('covered-body');
        $('body > .footer').show();
    }
}

export default WebsiteMiddleware;
