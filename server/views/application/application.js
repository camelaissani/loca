// Application
LOCA.application = (function($, History, bootbox, i18next) {
    var self;
    var waitCounter = 0;

    function Loca() {
        self = this;
        // History management only on html 5 browser
        if (History.enabled) {
            History.Adapter.bind(window, 'statechange', function() {
                var state = History.getState();
                _getViewAndUpdateData(state.data, false);
            });
        }

        // Wait / error dialog management
        LOCA.requester.beforeListener(function() {
            self.showWaitMessage();
            bootbox.hideAll();
        });

        LOCA.requester.afterListener(function() {
            self.hideWaitMessage();
        });

        LOCA.requester.responseFailListener(function(errors) {
            if (!errors) {
                bootbox.alert({title: i18next.t('Uh-oh!'), message: i18next.t('Server access problem. Check your network connection')});
            }
            else if (errors.length > 0) {
                bootbox.alert({title: i18next.t('Uh-oh!'), message: errors.join(' ')});
            }
        });

        // Header menu management
        $(document).on('click', '.nav-action', function() {
            var viewId = $(this).data('id');
            self.updateView(viewId, null, true);
        });
    }

    function _getViewAndUpdateData(data, noGetView, callback) {
        var oldNavMapItem,
            oldViewId,
            navMapItem = LOCA.routes[data.viewId],
            ajaxUrl = navMapItem.url(),
            $oldHeaderMenuItem = $('.nav li.active'),
            $newHeaderMenuItem = $('.nav li .nav-action[data-id="' + data.menuId + '"]').closest('li'),
            $mainPhoneBar = $('.main-mini-menu-bar'),
            $container = $('.view-container');

        function updateView(contentHtml) {
            if (contentHtml) {
                $container.html(contentHtml);
            }

            if ($oldHeaderMenuItem.data('value') !== data.menuId) {
                $oldHeaderMenuItem.removeClass('active');
                $newHeaderMenuItem.addClass('active');
            }
            $mainPhoneBar.find('.main-mini-menu-bar-title.active').removeClass('active');
            $mainPhoneBar.find('.main-mini-menu-bar-title[data-id="' + data.menuId + '"]').addClass('active');

            _updateDataInCurrentView(data, callback);
        }

        function requestPage() {
            LOCA.requester.ajax({type: 'GET', url: ajaxUrl}, updateView);
        }

        if (noGetView) {
            $container.css('visibility', 'hidden');
            $container.css('opacity', 0);
            updateView();
        } else {
            if ($oldHeaderMenuItem) {
                oldViewId = $oldHeaderMenuItem.find('.nav-action').data('id');
                oldNavMapItem = LOCA.routes[oldViewId];
                if (oldNavMapItem.pageExit) {
                    oldNavMapItem.pageExit(function () {
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

    function _updateDataInCurrentView(data, callback) {
        var navMapItem = LOCA.routes[data.viewId],
            $container = $('.view-container');

        $container.css('visibility', 'hidden');
        $container.css('opacity', 0);

        if (navMapItem.change) {
            navMapItem.change(function() {
                $container.css('visibility', 'visible');
                $container.css('opacity', 1);
                if (callback) {
                    callback();
                }
            });
        }
    }

    Loca.prototype.openPrintPreview = function(url) {
        window.open(url, '_blank', 'location=no,menubar=yes,status=no,titlebar=yes,toolbar=yes,scrollbars=yes,resizable=yes,width=1000,height=700');
    };

    Loca.prototype.updateData = function(viewId, callback) {
        var navMapItem = LOCA.routes[viewId],
            navData,
            $container;

        if (navMapItem) {
            navData = {
                menuId: navMapItem.menuId?navMapItem.menuId:viewId,
                viewId: viewId
            };
            _getViewAndUpdateData(navData, true, callback);
        } else {
            this.hideWaitMessage();
            $container = $('.view-container');
            $container.css('visibility', 'visible');
            $container.css('opacity', 1);
        }
    };

    Loca.prototype.updateView = function(viewId, qs, addToHistory) {
        var navMapItem = LOCA.routes[viewId],
            navData = {
                menuId: navMapItem.menuId?navMapItem.menuId:viewId,
                viewId: viewId
            },
            url = navMapItem.url(),
            facingUrl = '/index?view='+viewId,
            qsAsString;

        if (qs) {
            qsAsString = Object.toQueryString(qs);

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
            _getViewAndUpdateData(navData, false);
        }
    };

    Loca.prototype.showWaitMessage = function() {
        waitCounter++;
        $('#waitwindow').show();
    };

    Loca.prototype.hideWaitMessage = function() {
        waitCounter--;
        if (waitCounter <= 0) {
            waitCounter = 0;
            $('#waitwindow').hide();
        }
    };

    Loca.prototype.getViewFromQueryString = function(location) {
        var queryString = Object.fromQueryString(location),
            view = (queryString && queryString.view) ? queryString.view : '',
            hashIndex = view.indexOf('#'),
            viewId = hashIndex >= 0 ? view.substr(0, hashIndex) : view;

        return viewId;
    };

    return new Loca();
})(window.$, window.History, window.bootbox, window.i18next);
