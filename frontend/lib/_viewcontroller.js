import i18next from 'i18next';
import anilist from './anilist';
import anilayout from './anilayout';
import requester from './requester';

class ViewController {

    constructor(config) {
        this.config = config;
        this.filterValue = '';
        if (config.domListId) {
            this.list = new anilist(config.domListId,
                                    config.domViewId + '-list-row-template',
                                    config.domViewId + '-list-content-template');
        }
        this.initListeners();
    }

    initListeners() {
        // Manage list selection
        if (this.list) {
            this.list.on('list.selection.changed', (selection) => {
                const selectionCount = (selection && selection.length>0)?selection.length:0;
                const $selectionCardLabel = $(this.config.domViewId + ' .list-selection-menu-label');

                if (selectionCount>0) {
                    const $monoSelectionActions = $(this.config.domViewId + ' .user-action.only-mono-selection');

                    if (selectionCount>1) {
                        $monoSelectionActions.addClass('disabled');
                        $selectionCardLabel.html(i18next.t(this.config.listSelectionLabel, {count: selectionCount})+' ('+selectionCount+')');
                    }
                    else {
                        $monoSelectionActions.removeClass('disabled');
                        $selectionCardLabel.html(i18next.t(this.config.listSelectionLabel, {count: selectionCount}));
                    }

                    $(this.config.domViewId + ' .list-selected-elements').html(this.templateSelectedRow({rows: selection}));

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
        const that = this;
        $(document).on('click', this.config.domViewId + ' .user-action', function() {
            const $action = $(this),
                actionId = $action.data('id');

            // here manage cancel selection (internal action)
            if ($(this).hasClass('cancel-selection')) {
                if (that.list) {
                    that.list.unselectAll();
                }
                return false;
            }

            // here manage cancel on form (internal action)
            if ($(this).hasClass('cancel-form')) {
                that.closeForm(() => {
                    if (that.list) {
                        that.list.showAllRows(() => {
                            that.scrollToVisible();
                        });
                    }
                });
                return false;
            }
            if ($action.hasClass('disabled') ||
                ($action.hasClass('only-mono-selection') && that.list && that.list.getSelection().length>1)) {
                return false;
            }

            if (that.list) {
                if (actionId==='list-filter') {
                    that.list.unselectAll();
                    that.filterValue = $action.data('value');
                    that.list.filter(that.filterValue);
                    $(that.config.domViewId + ' .filterbar .user-action').removeClass('active');
                    if (that.filterValue) {
                        $(that.config.domViewId + ' .filterbar .user-action[data-value="'+that.filterValue+'"]').addClass('active');
                    } else {
                        $(that.config.domViewId + ' .filterbar .default-filter.user-action').addClass('active');
                    }
                }
                else if (actionId==='remove-item-from-selection') {
                    if (!$action.parent().hasClass('fixed')) {
                        that.list.unselect($action.attr('id'));
                    }
                }
                else if (that.onUserAction) {
                    that.onUserAction($action, actionId);
                }
            }
            else if (that.onUserAction) {
                that.onUserAction($action, actionId);
            }
            return false;
        });

        if (that.onInitListeners) {
            that.onInitListeners();
        }
    }

    dataChanged(callback) {
        const callbackEx = () => {
            if (this.onDataChanged) {
                this.onDataChanged(callback);
            } else if (callback) {
                callback();
            }
            if (this.config.defaultMenuId) {
                anilayout.showMenu(this.config.defaultMenuId);
            }
        };

        if (this.list) {
            this.list.bindDom();
            this.loadList(callbackEx);
            return;
        }
        callbackEx();
    }

    loadList(callback) {
        requester.ajax({
            type: 'GET',
            url: this.config.urls.overview
        },
        (overviewItems) => {
            const countAll = overviewItems.countAll;
            const countFree = overviewItems.countFree | overviewItems.countInactive;
            const countBusy = overviewItems.countBusy | overviewItems.countActive;
            $(this.config.domViewId + ' .all-filter-label').html('('+countAll+')');
            $(this.config.domViewId + ' .all-active-filter-label').html('('+countBusy+')');
            $(this.config.domViewId + ' .all-inactive-filter-label').html('('+countFree+')');

            // if (this.filterValue) {
            //     $(this.config.domViewId + ' .filterbar .user-action').removeClass('active');
            //     $(this.config.domViewId + ' .filterbar .user-action[data-value="'+this.filterValue+'"]').addClass('active');
            // } else {
            //     $(this.config.domViewId + ' .filterbar .user-action[data-value=""]').addClass('active');
            // }
            $(this.config.domViewId + ' .filterbar .user-action').removeClass('active');
            if (this.filterValue) {
                $(this.config.domViewId + ' .filterbar .user-action[data-value="'+this.filterValue+'"]').addClass('active');
            } else {
                $(this.config.domViewId + ' .filterbar .default-filter.user-action').addClass('active');
            }

            requester.ajax({
                type: 'GET',
                url: this.config.urls.items
            },
            (jsonItems) => {
                if (this.list) {
                    this.list.init({rows: jsonItems});
                }
                if (callback) {
                    callback(jsonItems);
                }
            });
        });
    }

    pageInitialized(callback) {
        if (!this.loaded) {
            if (this.onInitTemplates) {
                this.onInitTemplates();
            }

            if (this.list) {
                this.filterValue = $(this.config.domViewId + ' .filterbar .active.user-action').data('value');
                this.list.setFilterText(this.filterValue);
            }

            this.loaded = true;
        }

        if (callback) {
            callback();
        }
    }

    pageEntered(callback) {
        const callbackEx = () => {
            if (callback) {
                callback();
            }
            if (this.onPageEntered) {
                this.onPageEntered();
            }
        };

        callbackEx();
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

    openForm(formId) {
        anilayout.hideMenu(() => {
            anilayout.showMenu(formId+'-menu');
            if (this.list) {
                this.list.hideAllRows(() => {
                    anilayout.showSheet(formId);
                });
            }
        });
    }

    closeForm(callback) {
        anilayout.hideSheet();
        if (this.list && this.list.getSelection().length>0) {
            anilayout.hideMenu(() => {
                anilayout.showMenu(this.config.listSelectionMenuId);
                if (callback) {
                    callback();
                }
            });
        } else {
            anilayout.hideMenu(() => {
                if (this.config.defaultMenuId) {
                    anilayout.showMenu(this.config.defaultMenuId);
                }
                if (callback) {
                    callback();
                }
            });
        }
    }

    scrollToVisible(selector) {
        if (this.list) {
            const offset = parseInt($('.js-view-container').css('padding-top'), 10);
            if (!selector) {
                selector = '.list-row.active:first';
            }
            $(selector).velocity('scroll', {
                duration: 500, offset: -offset
            });
        }
    }
}

export default ViewController;
