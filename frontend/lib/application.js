import $ from 'jquery';
import i18next from 'i18next';
import bootbox from 'bootbox';
import History from 'historyjs';
import Sugar from 'sugar';
import requester from './requester';
import {LOCA} from './main';

class Application {

    constructor() {
        this.waitCounter = 0;
        // History management only on html 5 browser
        if (History.enabled) {
            History.Adapter.bind(window, 'statechange', () => {
                const state = History.getState();
                this._getViewAndUpdateData(state.data, false);
            });
        }

        // Wait / error dialog management
        requester.beforeListener(() => {
            this.showWaitMessage();
            bootbox.hideAll();
        });

        requester.afterListener(() => {
            this.hideWaitMessage();
        });

        requester.responseFailListener((errors) => {
            if (!errors) {
                bootbox.alert({title: i18next.t('Uh-oh!'), message: i18next.t('Server access problem. Check your network connection')});
            }
            else if (errors.length > 0) {
                bootbox.alert({title: i18next.t('Uh-oh!'), message: errors.join(' ')});
            }
        });
    }

    getViewFromQueryString(location) {
        const queryString = Sugar.Object.fromQueryString(location),
            view = (queryString && queryString.view) ? queryString.view : '',
            hashIndex = view.indexOf('#'),
            viewId = hashIndex >= 0 ? view.substr(0, hashIndex) : view;

        return viewId;
    }

    _getViewAndUpdateData(data, noGetView, callback) {
        const navMapItem = LOCA.routes[data.viewId],
            ajaxUrl = navMapItem.url(),
            $oldHeaderMenuItem = $('.nav li.active'),
            $newHeaderMenuItem = $('.nav li .nav-action[data-id="' + data.menuId + '"]').closest('li'),
            $mainPhoneBar = $('.main-mini-menu-bar'),
            $container = $('.view-container');

        const updateView = (contentHtml) => {
            if (contentHtml) {
                $container.html(contentHtml);
            }

            if ($oldHeaderMenuItem.data('value') !== data.menuId) {
                $oldHeaderMenuItem.removeClass('active');
                $newHeaderMenuItem.addClass('active');
            }
            $mainPhoneBar.find('.main-mini-menu-bar-title.active').removeClass('active');
            $mainPhoneBar.find('.main-mini-menu-bar-title[data-id="' + data.menuId + '"]').addClass('active');

            navMapItem.pageInitialized(() => {
                if (navMapItem.pageEntered) {
                    navMapItem.pageEntered();
                }
                this._updateDataInCurrentView(data, callback);
            });
        };

        const requestPage = () => {
            requester.ajax({type: 'GET', url: ajaxUrl}, updateView);
        };

        if (noGetView) {
            $container.css('visibility', 'hidden');
            $container.css('opacity', 0);
            updateView();
        } else {
            if ($oldHeaderMenuItem) {
                const oldViewId = $oldHeaderMenuItem.find('.nav-action').data('id');
                const oldNavMapItem = LOCA.routes[oldViewId];
                if (oldNavMapItem.pageExited) {
                    oldNavMapItem.pageExited(() => {
                        $container.css('visibility', 'hidden');
                        $container.css('opacity', 0);
                        requestPage();
                    });
                } else {
                    $container.css('visibility', 'hidden');
                    $container.css('opacity', 0);
                    requestPage();
                }
            } else {
                $container.css('visibility', 'hidden');
                $container.css('opacity', 0);
                requestPage();
            }
        }
    }

    _updateDataInCurrentView(data, callback) {
        const navMapItem = LOCA.routes[data.viewId],
            $container = $('.view-container');

        $container.css('visibility', 'hidden');
        $container.css('opacity', 0);

        if (navMapItem.dataChanged) {
            navMapItem.dataChanged(() => {
                $container.css('visibility', 'visible');
                $container.css('opacity', 1);
                if (callback) {
                    callback();
                }
            });
        }
    }

    openPrintPreview(url) {
        window.open(url, '_blank', 'location=no,menubar=yes,status=no,titlebar=yes,toolbar=yes,scrollbars=yes,resizable=yes,width=1000,height=700');
    }

    updateData(viewId, callback) {
        const navMapItem = LOCA.routes[viewId];

        if (navMapItem) {
            const navData = {
                menuId: navMapItem.menuId?navMapItem.menuId:viewId,
                viewId: viewId
            };
            this._getViewAndUpdateData(navData, true, callback);
        } else {
            this.hideWaitMessage();
            const $container = $('.view-container');
            $container.css('visibility', 'visible');
            $container.css('opacity', 1);
        }
    }

    updateView(viewId, qs, addToHistory) {
        const navMapItem = LOCA.routes[viewId],
            navData = {
                menuId: navMapItem.menuId?navMapItem.menuId:viewId,
                viewId: viewId
            };

        let facingUrl = '/index?view='+viewId;

        if (qs) {
            let url = navMapItem.url();
            const qsAsString = Sugar.Object.toQueryString(qs);

            if (url.indexOf('?')!==-1) {
                url += '?';
            }
            else {
                url += '&';
            }
            url += qsAsString;

            facingUrl += '&' + qsAsString;
        }


        if (addToHistory && History.enabled) {
            History.pushState(navData, navMapItem.title, facingUrl);
        } else {
            this._getViewAndUpdateData(navData, false);
        }
    }

    showWaitMessage() {
        this.waitCounter++;
        $('#waitwindow').show();
    }

    hideWaitMessage() {
        this.waitCounter--;
        if (this.waitCounter <= 0) {
            this.waitCounter = 0;
            $('#waitwindow').hide();
        }
    }
}

export default new Application();
