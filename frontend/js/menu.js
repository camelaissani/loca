import $ from 'jquery';
import application from './application';

function uriFromId(id) {
    if (id === 'website') {
        return {nav: `/view/${id}`, history: '/'};
    }
    return {nav: `/view/${id}`, history:`/${id}`};
}

function resizeRightMenus() {
    const parentSize = $('#right-menu-pane').width();
    $('.js-side-menu').each(function() {
        const $activeMenu = $(this);
        const affixPadding = $activeMenu.innerWidth() - $activeMenu.width();
        $activeMenu.width(parentSize - affixPadding);
    });
}

export default () => {
    $(document).on('click', '.js-nav-action', function() {
        const viewId = $(this).data('id');
        const uri = uriFromId(viewId);
        application.httpGet({
            uri: uri.nav,
            history: {
                state: {viewId},
                title: viewId,
                uri: uri.history
            }
        });
        $( '.dropdown.open .dropdown-toggle').dropdown('toggle');
        return false;
    });
    $(document).on('click', '.navbar-collapse.collapse.in a:not(.dropdown-toggle)', function() {
        $(this).closest('.navbar-collapse').collapse('hide');
    });
    $(document).on('click', '.navbar-collapse.collapse.in button:not(.navbar-toggle)', function() {
        $(this).closest('.navbar-collapse').collapse('hide');
    });

    // affix management for js-side-menu
    $(document).on('before-show-card', '.js-side-menu', function() {
        resizeRightMenus();
        $(this).affix({offset: { top: 0 }});
    });

    $(document).on('after-show-card', '.js-side-menu', function() {
        $(this).affix('checkPosition');
    });

    $(document).on('before-hide-card', '.js-side-menu', function() {
        $(window).off('.affix');
        $(this).removeData('bs.affix').removeClass('affix affix-top affix-bottom');
    });

    $(document).on('affix.bs.affix', '.js-side-menu', function() {
        const $menu = $(this);
        $menu.width($menu.width());
    });

    $(window).resize(() => resizeRightMenus());
};
