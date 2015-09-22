LOCA.ViewController = (function() {

    function ViewController(config) {
        this.config = config;
        this.filterValue = '';
        if (config.domListId) {
            this.list = new LOCA.List(config.domListId);
        }
        this.initListeners();
    }

    ViewController.prototype.initListeners = function() {
        // Manage list selection
        var self = this;
        if (self.list) {
            self.list.on('list.selection.changed', function(selection) {
                var $monoSelectionActions,
                    $selectionCardLabel = $(self.config.domViewId + ' .list-selection-menu-label');

                if (selection && selection.length>0) {
                    $monoSelectionActions = $(self.config.domViewId + ' .user-action.only-mono-selection');

                    if (selection.length>1) {
                        $monoSelectionActions.addClass('disabled');
                        $selectionCardLabel.html('Locataires sélectionnés');
                    }
                    else {
                        $monoSelectionActions.removeClass('disabled');
                        $selectionCardLabel.html('Locataire sélectionné');
                    }

                    $(self.config.domViewId + ' .list-selected-elements').html(self.templateSelectedRow({rows: selection}));

                    LOCA.layoutManager.showMenu(self.config.listSelectionMenuId);
                }
                else {
                    LOCA.layoutManager.hideMenu();
                }
            });
        }

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
                    self.list.filter($action.data('value'));
                    $action.closest('.dropdown').removeClass('open');
                    self.filterValue = $action.data('value');
                    $(self.config.domViewId + ' .selection-filter-label').html($action.text());
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
    };

    ViewController.prototype.loadData = function(callback) {
        var self = this;
        if (self.list) {
            self.list.bindDom();
            self.loadList(function() {
                self.onLoadData(callback);
            });
            return;
        }
        this.onLoadData(callback);
    };

    ViewController.prototype.loadList = function (callback) {
        var self = this;

        LOCA.requester.ajax({
            type: 'GET',
            url: self.config.urls.overview
        },
        function (overviewItems) {
            var countAll = overviewItems.countAll;
            var countFree = overviewItems.countFree | overviewItems.countActive;
            var countBusy = overviewItems.countBusy | overviewItems.countInactive;
            $(self.config.domViewId + ' .all-filter-label').html(countAll);
            $(self.config.domViewId + ' .all-active-filter-label').html(countBusy);
            $(self.config.domViewId + ' .all-inactive-filter-label').html(countFree);

            if (self.filterValue) {
                $(self.config.domViewId + ' .selection-filter-label').html($(self.config.domViewId + ' .filterbar .user-action[data-value="'+self.filterValue+'"]').text());
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

    ViewController.prototype.initTemplates = function() {
        // Handlebars templates
    };

    ViewController.prototype.startUp = function(callback) {
        var self = this;

        if (self.initTemplates) {
            self.initTemplates();
        }

        if (self.list) {
            self.filterValue = $(self.config.domViewId + ' .filterbar .active.user-action').data('value');
            self.list.setFilterText(self.filterValue);
        }

        if (callback) {
            callback();
        }
    };

    ViewController.prototype.pageExit = function (callback) {
        var self = this;
        if (self.list) {
            $(self.config.domViewId + ' .filterbar').hide();
        }
        LOCA.layoutManager.hideMenu(function () {
            if (self.list) {
                self.list.hideAllRows(callback);
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

        if (self.list) {
            $('.filterbar').hide();
        }
        LOCA.layoutManager.showMenu(formId+'-menu');
        if (self.list) {
            self.list.hideAllRows(function() {
                LOCA.layoutManager.showSheet(formId);
            });
        }
    };

    ViewController.prototype.closeForm = function(callback) {
        var self = this;
        if (self.list) {
            $(self.config.domListId + ' .list-content-selection-label').velocity('transition.bounceRightOut');
        }
        LOCA.layoutManager.hideSheet();
        if (self.list) {
            $('.filterbar').show();
        }
        if (self.list && self.list.getSelection().length>0) {
            LOCA.layoutManager.showMenu(self.config.listSelectionMenuId);
            if (callback) {
                callback();
            }
        } else {
            LOCA.layoutManager.hideMenu(callback);
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

})();