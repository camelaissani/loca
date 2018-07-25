import i18next from 'i18next';
import BaseViewMiddleware from './baseview_middleware';
import application from './application';
import anilist from './lib/anilist';
import anilayout from './lib/anilayout';

class ViewController extends BaseViewMiddleware {

    constructor(config) {
        super();
        this.config = config;
        this.filterValue = '';
        if (config.domListId) {
            this.list = new anilist(
                config.domListId,
                config.domViewId + '-list-row-template',
                config.domViewId + '-list-content-template'
            );
        }
        this.initListener();
    }

    initListener() {
        // Manage list selection
        if (this.list) {
            this.list.on('list.selection.changed', (selection) => {
                const selectionCount = (selection && selection.length>0)?selection.length:0;
                const $selectionCardLabel = $(this.config.domViewId + ' .js-list-selection-menu-label');

                if (selectionCount>0) {
                    const $monoSelectionActions = $(this.config.domViewId + ' .js-user-action.js-only-mono-selection');

                    if (selectionCount>1) {
                        $monoSelectionActions.addClass('disabled');
                        $selectionCardLabel.html(i18next.t(this.config.listSelectionLabel, {count: selectionCount})+' ('+selectionCount+')');
                    }
                    else {
                        $monoSelectionActions.removeClass('disabled');
                        $selectionCardLabel.html(i18next.t(this.config.listSelectionLabel, {count: selectionCount}));
                    }

                    $(this.config.domViewId + ' .js-list-selected-elements').html(this.templateSelectedRow({rows: selection}));

                    anilayout.showMenu(this.config.listSelectionMenuId);
                }
                else {
                    if (!this.config.defaultMenuId) {
                        anilayout.hideMenu();
                    } else if (!anilayout.isMenuVisible(this.config.defaultMenuId)) {
                        anilayout.hideMenu(() => {
                            if (this.config.defaultMenuId) {
                                anilayout.showMenu(this.config.defaultMenuId);
                            }
                        });
                    }
                }
            });
        }

        // Manage click on view (form and list)
        const self = this;
        $(document).on('click', this.config.domViewId + ' .js-user-action', function() {
            const $action = $(this),
                actionId = $action.data('id');

            // here manage cancel selection (internal action)
            if ($(this).hasClass('js-cancel-selection')) {
                if (self.list) {
                    self.list.unselectAll();
                }
                return false;
            }

            // here manage cancel on form (internal action)
            if ($(this).hasClass('js-cancel-form')) {
                self.closeForm(() => {
                    if (self.list) {
                        self.list.showAllRows();
                    }
                });
                return false;
            }
            if ($action.hasClass('disabled') ||
                ($action.hasClass('js-only-mono-selection') && self.list && self.list.getSelection().length>1)) {
                return false;
            }

            if (self.list) {
                if (actionId==='list-filter') {
                    self.list.unselectAll();
                    self.filterValue = $action.data('value');
                    self.list.filter(self.filterValue);
                    $(self.config.domViewId + ' .js-filterbar .js-user-action').removeClass('active');
                    if (self.filterValue) {
                        $(self.config.domViewId + ' .js-filterbar .js-user-action[data-value="'+self.filterValue+'"]').addClass('active');
                    } else {
                        $(self.config.domViewId + ' .js-filterbar .js-default-filter.js-user-action').addClass('active');
                    }
                }
                else if (actionId==='remove-item-from-selection') {
                    if (!$action.parent().hasClass('fixed')) {
                        self.list.unselect($action.attr('id'));
                    }
                }
                else if (self.onUserAction) {
                    self.onUserAction($action, actionId);
                }
            }
            else if (self.onUserAction) {
                self.onUserAction($action, actionId);
            }
            return false;
        });

        if (self.onInitListener) {
            self.onInitListener();
        }
    }

    // overriden
    updated() {
        super.updated();
        const callbackEx = () => {
            if (this.onDataChanged) {
                this.onDataChanged();
            }
            if (this.config.defaultMenuId) {
                anilayout.showMenu(this.config.defaultMenuId);
            }
        };

        if (!this.loaded) {
            if (this.onInitTemplate) {
                this.onInitTemplate();
            }

            if (this.list) {
                this.filterValue = $(this.config.domViewId + ' .js-filterbar .active.js-user-action').data('value');
                this.list.setFilterText(this.filterValue);
            }

            this.loaded = true;
        }

        if (this.list) {
            this.list.bindDom();
            this.loadList(callbackEx);
            return;
        }
        callbackEx();
    }

    loadList(callback) {
        application.httpGet(
            this.config.urls.overview,
            (req, res) => {
                const overviewItems = JSON.parse(res.responseText);
                const countAll = overviewItems.countAll;
                const countFree = overviewItems.countFree | overviewItems.countInactive;
                const countBusy = overviewItems.countBusy | overviewItems.countActive;
                $(this.config.domViewId + ' .js-all-filter-label').html('('+countAll+')');
                $(this.config.domViewId + ' .all-active-filter-label').html('('+countBusy+')');
                $(this.config.domViewId + ' .all-inactive-filter-label').html('('+countFree+')');

                $(this.config.domViewId + ' .js-filterbar .js-user-action').removeClass('active');
                if (this.filterValue) {
                    $(this.config.domViewId + ' .js-filterbar .js-user-action[data-value="'+this.filterValue+'"]').addClass('active');
                } else {
                    $(this.config.domViewId + ' .js-filterbar .js-default-filter.js-user-action').addClass('active');
                }

                application.httpGet(
                    this.config.urls.items,
                    (req, res) => {
                        const jsonItems = JSON.parse(res.responseText);
                        if (this.list) {
                            this.list.init({rows: jsonItems});
                        }
                        if (callback) {
                            callback(jsonItems);
                        }
                    });
            }
        );
    }

    entered() {
        super.entered();

        if (this.onPageEntered) {
            this.onPageEntered();
        }
    }

    pageExited(callback) {
        var callbackEx = () => {
            if (callback) {
                callback();
            }
            if (this.onPageExited) {
                this.onPageExited();
            }
        };

        anilayout.hideMenu(() => {
            if (this.list) {
                this.list.hideAllRows(() => {
                    callbackEx();
                });
            } else {
                callbackEx();
            }
        });
    }

    getSelectedIds() {
        const selection = [];

        if (this.list) {
            const rowsSelected = this.list.getSelectedData();

            for (let i=0; i<rowsSelected.length; i++) {
                selection.push(rowsSelected[i]._id);
            }
        }
        return selection;
    }

    openForm(formId, menuId, callback) {
        const menuCallback = () => {
            anilayout.showMenu(menuId ? menuId : formId+'-menu', () => {
                if (callback) {
                    callback();
                }
                window.scroll(0, 0);
            });
        };

        this.scrollY = window.scrollY;

        anilayout.hideMenu(() => {
            if (this.list) {
                this.list.hideAllRows(() => {
                    anilayout.showSheet(formId);
                    menuCallback();
                });
            } else {
                anilayout.showSheet(formId, menuCallback);
                menuCallback();
            }
        });
    }

    closeForm(callback) {
        const callbackEx = () => {
            if (callback) {
                callback();
            }
            window.scroll(0, this.scrollY);
        };
        anilayout.hideSheet();
        if (this.list && this.list.getSelection().length>0) {
            anilayout.hideMenu(() => {
                anilayout.showMenu(this.config.listSelectionMenuId);
                callbackEx();
            });
        } else {
            anilayout.hideMenu(() => {
                if (this.config.defaultMenuId) {
                    anilayout.showMenu(this.config.defaultMenuId);
                }
                callbackEx();
            });
        }
    }

    showMenu(dataId, callback) {
        anilayout.showMenu(dataId, callback);
    }

    hideMenu(callback) {
        anilayout.hideMenu(callback);
    }

    scrollToElement(selector) {
        const $element = $(selector);
        if ($element.length > 0) {
            const bodyTopPadding = parseInt($('body').css('padding-top'), 10);
            window.scroll(0,  $element.offset().top - bodyTopPadding);
        }
    }
}

export default ViewController;
