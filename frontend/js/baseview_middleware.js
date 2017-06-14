import $ from 'jquery';
import frontexpress from 'frontexpress';

class BaseViewMiddleware extends frontexpress.Middleware {
    entered(req) {
        // hide footer and background image
        $('body').removeClass('covered-body');
        $('body > .footer').hide();

        const menus = document.querySelectorAll('li > .js-nav-action');
        for (let i = 0; i < menus.length; i++) {
            const menu = menus[i];
            const parentMenu = menu.parentNode;
            const re = new RegExp(`^/view/${menu.dataset.id}|^/page/${menu.dataset.id}`);
            if (req.uri.match(re)) {
                parentMenu.className = 'active';
                menu.focus();
            } else {
                parentMenu.className = '';
            }
        }
    }

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

export default BaseViewMiddleware;