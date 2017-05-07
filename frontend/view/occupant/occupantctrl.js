import $ from 'jquery';
import Handlebars from 'handlebars';
import bootbox from 'bootbox';
import i18next from 'i18next';
import moment from 'moment';
import ViewController from '../../lib/_viewcontroller';
import requester from '../../lib/requester';
import {LOCA} from '../../lib/main';
import application from '../../lib/application';
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

        Handlebars.registerPartial('occupant-invoice-links-template', $('#occupant-invoice-links-template').html());
        this.templateInvoices = Handlebars.compile($('#occupant-invoices-template').html());

        const $occupantsSelected = $('#view-occupant-selected-list-template');
        if ($occupantsSelected.length >0) {
            this.templateSelectedRow = Handlebars.compile($occupantsSelected.html());
        }
    }

    _loadPropertyList(callback) {
        requester.ajax({
            type: 'GET',
            url: '/api/properties'
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
                    type: 'DELETE',
                    url: `/api/occupants/${selectionIds.join()}`,
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
                        this.list.select($('.js-list-row#'+data._id), true);
                        this.scrollToVisible();
                    });
                });
            });
        }
        else if (actionId==='list-action-invoices') {
            $('#occupant-invoices').html('');
            this.openForm('invoices');
            requester.ajax({
                type: 'GET',
                url: `/api/rents/occupant/${selection[0]._id}`
            }, (rentsHistory) => {
                const current = moment();
                let count = 0;
                const rents = rentsHistory.rents.reverse().filter((rent) => {
                    if (moment(`${rent.year}-${rent.month}-01`).isSameOrBefore(current)) {
                        count++;
                        return count <= 48; // view last 48 months
                    }
                    return false;
                }).reduce((result, rent) => {
                    let foundYears = result.years.filter(year => year.year === rent.year);
                    if (!foundYears || foundYears.length===0) {
                        const yearObject = {
                            occupantId: selection[0]._id,
                            year: rent.year,
                            months:[]
                        };
                        result.years.push(yearObject);
                        foundYears = [yearObject];
                    }
                    foundYears[0].months.push({
                        occupantId: selection[0]._id,
                        year: Number(rent.year),
                        month: Number(rent.month),
                        totalToPay: rent.totalToPay,
                        payment: rent.payment
                    });
                    return result;
                }, {years:[]});
                $('#occupant-invoices').html(this.templateInvoices(rents));
            });
        }
        else if (actionId==='invoice-link') {
            const month = $action.data('month');
            const year = $action.data('year');
            const occupantId = $action.data('occupantId');
            let url = `/api/documents/print/invoice/occupants/${occupantId}/${year}`;
            if (month) {
                url += `/${month}`;
            }
            application.openPrintPreview(url);
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
                            url: '/api/occupants/overview'
                        },
                        (occupantsOverview) => {
                            const countAll = occupantsOverview.countAll;
                            const countActive = occupantsOverview.countActive;
                            const countInactive = occupantsOverview.countInactive;
                            $('#view-occupant .js-all-filter-label').html('('+countAll+')');
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
            this.openForm('rents-history', true);
            requester.ajax({
                type: 'GET',
                url: `/api/rents/occupant/${selection[0]._id}`
            }, (rentsHistory) => {
                $('#history-rents-table').html(this.templateHistoryRents(rentsHistory));
            });
        }
        else if (actionId==='list-action-print') {
            this.openForm('print-doc-selector');
        }
    }

    onInitListeners() {
        $(document).on('click', '#view-occupant #printofficechecklist', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/checklist/occupants/${selection}`);
            return false;
        });

        $(document).on('click', '#view-occupant #printcontract', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/contract/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-occupant #printcustomcontract', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/customcontract/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-occupant #printdomcontract', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/domcontract/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-occupant #printguarantycertificate', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/guarantycertificate/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-occupant #printguarantypayback', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/guarantypaybackcertificate/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-occupant #printguarantyrequest', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/guarantyrequest/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-occupant #printinsurancerequest', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/insurance/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
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
