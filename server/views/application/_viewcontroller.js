LOCA.ViewController = (function(i18next) {

    function ViewController(config) {
        this.config = config;
        this.filterValue = '';
        if (config.domListId) {
            this.list = new LOCA.List(config.domListId,
                                      config.domViewId + '-list-row-template',
                                      config.domViewId + '-list-content-template');
        }
        this.initListeners();
    }

    ViewController.prototype.initListeners = function() {
        // Manage list selection
        var self = this;
        if (self.list) {
            self.list.on('list.selection.changed', function(selection) {
                var $monoSelectionActions,
                    selectionCount = (selection && selection.length>0)?selection.length:0,
                    $selectionCardLabel = $(self.config.domViewId + ' .list-selection-menu-label');

                if (selectionCount>0) {
                    $monoSelectionActions = $(self.config.domViewId + ' .user-action.only-mono-selection');

                    if (selectionCount>1) {
                        $monoSelectionActions.addClass('disabled');
                        $selectionCardLabel.html(i18next.t(self.config.listSelectionLabel, {count: selectionCount})+' ('+selectionCount+')');
                    }
                    else {
                        $monoSelectionActions.removeClass('disabled');
                        $selectionCardLabel.html(i18next.t(self.config.listSelectionLabel, {count: selectionCount}));
                    }

                    $(self.config.domViewId + ' .list-selected-elements').html(self.templateSelectedRow({rows: selection}));

                    LOCA.layoutManager.showMenu(self.config.listSelectionMenuId);
                }
                else {
                    if (!self.config.defaultMenuId) {
                        LOCA.layoutManager.hideMenu();
                    } else if (!LOCA.layoutManager.isMenuVisible(self.config.defaultMenuId)) {
                        LOCA.layoutManager.hideMenu(function() {
                            if (self.config.defaultMenuId) {
                                LOCA.layoutManager.showMenu(self.config.defaultMenuId);
                            }
                        });
                    }
                }
            });
        }

        // Manage click on view (form and list)
        $(document).on('click', self.config.domViewId + ' .user-action', function() {
            var $action = $(this),
                actionId = $action.data('id');

            // here manage cancel selection (internal action)
            if ($(this).hasClass('cancel-selection')) {
                if (self.list) {
                    self.list.unselectAll();
                }
                return false;
            }

            // here manage cancel on form (internal action)
            if ($(this).hasClass('cancel-form')) {
                self.closeForm(function () {
                    if (self.list) {
                        self.list.showAllRows(function(){
                            self.scrollToVisible();
                        });
                    }
                });
                return false;
            }
            if ($action.hasClass('disabled') ||
                ($action.hasClass('only-mono-selection') && self.list && self.list.getSelection().length>1)) {
                return false;
            }

            if (self.list) {
                if (actionId==='list-filter') {
                    self.list.unselectAll();
                    self.filterValue = $action.data('value');
                    self.list.filter(self.filterValue);
                    $(self.config.domViewId + ' .filterbar .user-action').removeClass('active');
                    if (self.filterValue) {
                        $(self.config.domViewId + ' .filterbar .user-action[data-value="'+self.filterValue+'"]').addClass('active');
                    } else {
                        $(self.config.domViewId + ' .filterbar .default-filter.user-action').addClass('active');
                    }
                }
                else if (actionId==='remove-item-from-selection') {
                    if (!$action.parent().hasClass('fixed')) {
                        self.list.unselect($action.attr('id'));
                    }
                }
                else {
                    self.onUserAction($action, actionId);
                }
            }
            else {
                self.onUserAction($action, actionId);
            }
            return false;
        });

        if (self.onInitListeners) {
            self.onInitListeners();
        }
    };

    ViewController.prototype.dataChanged = function(callback) {
        var self = this;

        var callbackEx = function() {
            if (callback) {
                callback();
            }
            if (self.onDataChanged) {
                self.onDataChanged();
            }
            if (self.config.defaultMenuId) {
                LOCA.layoutManager.showMenu(self.config.defaultMenuId);
            }
        };

        if (self.list) {
            self.list.bindDom();
            self.loadList(callbackEx);
            return;
        }
        callbackEx();
    };

    ViewController.prototype.loadList = function (callback) {
        var self = this;

        LOCA.requester.ajax({
            type: 'GET',
            url: self.config.urls.overview
        },
        function (overviewItems) {
            var countAll = overviewItems.countAll;
            var countFree = overviewItems.countFree | overviewItems.countInactive;
            var countBusy = overviewItems.countBusy | overviewItems.countActive;
            $(self.config.domViewId + ' .all-filter-label').html('('+countAll+')');
            $(self.config.domViewId + ' .all-active-filter-label').html('('+countBusy+')');
            $(self.config.domViewId + ' .all-inactive-filter-label').html('('+countFree+')');

            // if (self.filterValue) {
            //     $(self.config.domViewId + ' .filterbar .user-action').removeClass('active');
            //     $(self.config.domViewId + ' .filterbar .user-action[data-value="'+self.filterValue+'"]').addClass('active');
            // } else {
            //     $(self.config.domViewId + ' .filterbar .user-action[data-value=""]').addClass('active');
            // }
            $(self.config.domViewId + ' .filterbar .user-action').removeClass('active');
            if (self.filterValue) {
                $(self.config.domViewId + ' .filterbar .user-action[data-value="'+self.filterValue+'"]').addClass('active');
            } else {
                $(self.config.domViewId + ' .filterbar .default-filter.user-action').addClass('active');
            }

            LOCA.requester.ajax({
                type: 'GET',
                url: self.config.urls.items
            },
            function(jsonItems) {
                if (self.list) {
                    self.list.init({rows: jsonItems});
                }
                if (callback) {
                    callback(jsonItems);
                }
            });
        });
    };

    ViewController.prototype.pageInitialized = function(callback) {
        var self = this;

        if (!self.loaded) {
            if (self.onInitTemplates) {
                self.onInitTemplates();
            }

            if (self.list) {
                self.filterValue = $(self.config.domViewId + ' .filterbar .active.user-action').data('value');
                self.list.setFilterText(self.filterValue);
            }

            self.loaded = true;
        }

        if (callback) {
            callback();
        }
    };

    ViewController.prototype.pageEntered = function (callback) {
        var self = this;
        var callbackEx = function() {
            if (callback) {
                callback();
            }
            if (self.onPageEntered) {
                self.onPageEntered();
            }
        };

        callbackEx();
    };

    ViewController.prototype.pageExited = function (callback) {
        var self = this;
        var callbackEx = function() {
            if (callback) {
                callback();
            }
            if (self.onPageExited) {
                self.onPageExited();
            }
        };

        LOCA.layoutManager.hideMenu(function() {
            if (self.list) {
                self.list.hideAllRows(function() {
                    callbackEx();
                });
            } else {
                callbackEx();
            }
        });
    };

    ViewController.prototype.getSelectedIds = function() {
        var self = this,
            rowsSelected,
            selection = [],
            i;

        if (self.list) {
            rowsSelected = self.list.getSelectedData();

            for ( i=0; i<rowsSelected.length; i++) {
                selection.push(rowsSelected[i]._id);
            }
        }
        return selection;
    };

    ViewController.prototype.openForm = function(formId) {
        var self = this;

        LOCA.layoutManager.hideMenu(function() {
            LOCA.layoutManager.showMenu(formId+'-menu');
            if (self.list) {
                self.list.hideAllRows(function() {
                    LOCA.layoutManager.showSheet(formId);
                });
            }
        });
    };

    ViewController.prototype.closeForm = function(callback) {
        var self = this;
        LOCA.layoutManager.hideSheet();
        if (self.list && self.list.getSelection().length>0) {
            LOCA.layoutManager.hideMenu(function() {
                LOCA.layoutManager.showMenu(self.config.listSelectionMenuId);
                if (callback) {
                    callback();
                }
            });
        } else {
            LOCA.layoutManager.hideMenu(function() {
                if (self.config.defaultMenuId) {
                    LOCA.layoutManager.showMenu(self.config.defaultMenuId);
                }
                if (callback) {
                    callback();
                }
            });
        }
    };

    ViewController.prototype.scrollToVisible = function(selector) {
        var offset;
        if (this.list) {
            offset = parseInt($('.view-container').css('padding-top'), 10);
            if (!selector) {
                selector = '.list-row.active:first';
            }
            $(selector).velocity('scroll', {
                duration: 500, offset: -offset
            });
        }
    };

    return ViewController;

})(window.i18next);
