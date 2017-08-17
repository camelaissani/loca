import frontexpress from 'frontexpress';

class MenuMiddleware extends frontexpress.Middleware {
    entered(req) {
        const menus = document.querySelectorAll('li > .js-nav-action');
        for (let i = 0; i < menus.length; i++) {
            const menu = menus[i];
            const parentMenu = menu.parentNode;
            const re = new RegExp(`^/view/${menu.dataset.id}|^/${menu.dataset.id}`);
            if (req.uri.match(re)) {
                parentMenu.className = 'active';
                menu.focus();
            } else {
                parentMenu.className = '';
            }
        }
    }
}

export default MenuMiddleware;