import $ from 'jquery';
import frontexpress from 'frontexpress';

class ViewMiddleware extends frontexpress.Middleware {
    updated(req, res) {
        // fill view container
        if (res.responseText) {
            const $container = $('.js-view-container');
            $container.html(res.responseText);
            $container.css('visibility', 'visible');
            $container.css('opacity', 1);
        }
    }
}

export default ViewMiddleware;