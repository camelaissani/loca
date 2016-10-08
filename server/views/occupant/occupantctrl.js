import $ from 'jquery';
import Handlebars from 'handlebars';
import bootbox from 'bootbox';
import i18next from 'i18next';
import ViewController from '../application/_viewcontroller';
import requester from '../common/requester';
import {LOCA} from '../application/main';
import application from '../application/application';
import OccupantForm from './occupantform';
import ContractDocumentsForm from './contractdocumentsform';

class OccupantCtrl extends ViewController {

    constructor() {
        super({
            domViewId: '#view-occupant',
            domListId: '#occupants',
            defaultMenuId: 'occupants-menu',
            listSelectionLabel: 'Selected tenant',
            listSelectionMenuId: '#occupants-selection-menu',
            urls: {
                overview: '/api/occupants/overview',
                items: '/api/occupants'
            }
        });
        this.form = new OccupantForm();
        this.documentsForm = new ContractDocumentsForm();
    }

    onInitTemplates() {
        // Handlebars templates
        Handlebars.registerPartial('history-rent-row-template', $('#history-rent-row-template').html());
        this.templateHistoryRents = Handlebars.compile($('#history-rents-template').html());

        const $occupantsSelected = $('#view-occupant-selected-list-template');
        if ($occupantsSelected.length >0) {
            this.templateSelectedRow = Handlebars.compile($occupantsSelected.html());
        }
    }

    _loadPropertyList(callback) {
        requester.ajax({
            type: 'GET',
            url: '/api/properties?month='+ LOCA.currentMonth +'&year='+ LOCA.currentYear
        },
        (properties) => {
            if (callback) {
                callback(properties);
            }
        });
    }

    onUserAction($action, actionId) {
        const selection = this.list.getSelectedData();

        if (actionId==='list-action-edit-occupant') {
            this._loadPropertyList((properties) => {
                this.form.setData(selection[0], properties);
                this.openForm('occupant-form');
            });
        }
        else if (actionId==='list-action-add-occupant') {
            this.list.unselectAll();
            this._loadPropertyList((properties) => {
                this.form.setData(null, properties);
                this.openForm('occupant-form');
            });
        }
        else if (actionId==='list-action-remove-occupant') {
            bootbox.confirm(i18next.t('Are you sure to remove this tenant?'), (result) => {
                if (!result) {
                    return;
                }
                const selectionIds = [];
                for (let index=0; index < selection.length; ++index) {
                    selectionIds.push(selection[index]._id);
                }
                requester.ajax({
                    type: 'POST',
                    url: '/occupants/remove',
                    data: {ids: selectionIds},
                    dataType: 'json'
                },
                (response) => {
                    if (!response.errors || response.errors.length===0) {
                        this.list.unselectAll();
                        this.loadList(() => {
                            this.closeForm();
                        });
                    }
                });
            });
        }
        else if (actionId==='list-action-save-form') {
            this.form.submit((data) => {
                this.closeForm(() => {
                    this.loadList(() => {
                        this.list.select($('.list-row#'+data._id), true);
                        this.scrollToVisible();
                    });
                });
            });
        }
        else if (actionId==='list-action-manage-documents') {
            this.documentsForm.setData(selection[0]);
            this.openForm('contract-documents-form');
        }
        else if (actionId==='list-action-save-contract-documents') {
            this.documentsForm.submit((data) => {
                this.closeForm(() => {
                    if (data._id) {
                        requester.ajax({
                            type: 'GET',
                            url: '/api/occupants/overview?month='+ LOCA.currentMonth +'&year='+ LOCA.currentYear
                        },
                        (occupantsOverview) => {
                            const countAll = occupantsOverview.countAll;
                            const countActive = occupantsOverview.countActive;
                            const countInactive = occupantsOverview.countInactive;
                            $('#view-occupant .all-filter-label').html('('+countAll+')');
                            $('#view-occupant .all-active-filter-label').html('('+countActive+')');
                            $('#view-occupant .all-inactive-filter-label').html('('+countInactive+')');

                            this.list.update(data);
                            this.list.showAllRows(() => {
                                this.scrollToVisible();
                            });
                        });
                    }
                });
            });
        }
        else if (actionId==='list-action-rents-history') {
            $('#history-rents-table').html('');
            requester.ajax({
                type: 'GET',
                url: '/api/rents/occupant?id='+selection[0]._id
            },
            (rentsHistory) => {
                $('#history-rents-table').html(this.templateHistoryRents(rentsHistory));
            });
            this.openForm('rents-history', true);
        }
        else if (actionId==='list-action-print') {
            this.openForm('print-doc-selector');
        }
    }

    onInitListeners() {
        $(document).on('click', '#view-occupant #printofficechecklist', () => {
            //application.openPrintPreview('/public/pdf/checklist.pdf');
            const selection = this.getSelectedIds();
            application.openPrintPreview('/checklist?occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printcontract', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview('/contract?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printcustomcontract', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview('/customcontract?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printdomcontract', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview('/domcontract?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printguarantycertificate', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview('/guarantycertificate?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printguarantypayback', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview('/guarantypaybackcertificate?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printguarantyrequest', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview('/guarantyrequest?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-occupant #printinsurancerequest', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview('/insurance?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

    }

    onDataChanged(callback) {
        this.form.bindForm();
        this.documentsForm.bindForm();
        if (callback) {
            callback();
        }
    }
}

export default new OccupantCtrl();
