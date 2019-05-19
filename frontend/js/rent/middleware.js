import $ from 'jquery';
import moment from 'moment';
import Handlebars from 'handlebars';
import bootbox from 'bootbox';
import i18next from 'i18next';
import application from '../application';
import ViewController from '../viewcontroller';
import Helper from '../lib/helper';
import PaymentForm from './paymentform';

const LOCA = application.get('LOCA');

class RentMiddleware extends ViewController {

    constructor() {
        super({
            domViewId: '#view-rent',
            domListId: '#rents',
            defaultMenuId: 'rents-menu',
            listSelectionLabel: 'Selected rent',
            listSelectionMenuId: 'rents-selection-menu',
            urls: {
                overview: '/api/rents/overview',
                items: '/api/rents'
            }
        });
        this.form = new PaymentForm();
    }

    // overriden
    loadList(callback) {
        application.httpGet(
            `/api/rents/overview/${LOCA.currentYear}/${LOCA.currentMonth}`,
            (req, res) => {
                const rentsOverview = JSON.parse(res.responseText);
                const countAll = rentsOverview.countAll;
                const countPaid = rentsOverview.countPaid;
                const countPartiallyPaid = rentsOverview.countPartiallyPaid;
                const countNotPaid = rentsOverview.countNotPaid;
                const totalToPay = rentsOverview.totalToPay;
                const totalNotPaid = rentsOverview.totalNotPaid;
                const totalPaid = rentsOverview.totalPaid;
                $('.js-all-filter-label').html('('+countAll+')');
                $('.js-paid-filter-label').html('('+(countPaid + countPartiallyPaid)+')');
                $('.js-not-paid-filter-label').html('('+countNotPaid+')');
                //$('.partially-js-paid-filter-label').html(countPartiallyPaid);
                $('.js-total-topay').html(Helper.formatMoney(totalToPay));
                $('.js-total-notpaid').html(Helper.formatMoney(totalNotPaid));
                $('.js-total-paid').html(Helper.formatMoney(totalPaid));

                $('#view-rent .js-filterbar .js-user-action').removeClass('active');
                if (this.filterValue) {
                    $('#view-rent .js-filterbar .js-user-action[data-value="'+this.filterValue+'"]').addClass('active');
                } else {
                    $('#view-rent .js-filterbar .js-default-filter.js-user-action').addClass('active');
                }

                application.httpGet(
                    `/api/rents/${LOCA.currentYear}/${LOCA.currentMonth}`,
                    (req, res) => {
                        const jsonRents = JSON.parse(res.responseText);
                        this.list.init({rows: jsonRents});
                        if (callback) {
                            callback();
                        }
                    });
            }
        );
    }

    // callback
    onInitTemplate() {
        // Handlebars templates
        Handlebars.registerPartial('history-rent-row-template', $('#history-rent-row-template').html());
        Handlebars.registerPartial('view-rent-payment-badges-template', $('#view-rent-payment-badges-template').html());
        Handlebars.registerPartial('view-rent-email-status-badges-template', $('#view-rent-email-status-badges-template').html());

        this.templateHistoryRents = Handlebars.compile($('#history-rents-template').html());

        const $rentsSelected = $('#view-rent-selected-list-template');
        if ($rentsSelected.length >0) {
            this.templateSelectedRow = Handlebars.compile($rentsSelected.html());
        }
        const $emailStatus = $('#email-status-template');
        if ($emailStatus.length >0) {
            this.emailStatus = Handlebars.compile($emailStatus.html());
        }
    }

    // callback
    onInitListener() {
        $(document).on('click', '#view-rent #emailinvoice', () => {
            const tenantIds = this.getSelectedIds();
            bootbox.confirm(i18next.t('Are you sure to send invoices by email?'), (result) => {
                if (!result) {
                    return;
                }
                application.sendEmail(tenantIds, 'invoice', LOCA.currentYear, LOCA.currentMonth, status => {
                    bootbox.alert(this.emailStatus({results: status}), () => {
                        this.closeForm(() => {
                            this.loadList();
                        });
                    });
                });
            });
            return false;
        });

        $(document).on('click', '#view-rent #emailrentcall', () => {
            const tenantIds = this.getSelectedIds();
            bootbox.confirm(i18next.t('Are you sure to send rent notices by email?'), (result) => {
                if (!result) {
                    return;
                }
                application.sendEmail(tenantIds, 'rentcall', LOCA.currentYear, LOCA.currentMonth, status => {
                    bootbox.alert(this.emailStatus({results: status}), () => {
                        this.closeForm(() => {
                            this.loadList();
                        });
                    });
                });
            });
            return false;
        });

        $(document).on('click', '#view-rent #emailrentcallreminder', () => {
            const tenantIds = this.getSelectedIds();
            bootbox.confirm(i18next.t('Are you sure to send rent notices by email?'), (result) => {
                if (!result) {
                    return;
                }
                application.sendEmail(tenantIds, 'rentcall_reminder', LOCA.currentYear, LOCA.currentMonth, status => {
                    bootbox.alert(this.emailStatus({results: status}), () => {
                        this.closeForm(() => {
                            this.loadList();
                        });
                    });
                });
            });
            return false;
        });

        $(document).on('click', '#view-rent #emaillastrentcallreminder', () => {
            const tenantIds = this.getSelectedIds();
            bootbox.confirm(i18next.t('Are you sure to send rent notices by email?'), (result) => {
                if (!result) {
                    return;
                }
                application.sendEmail(tenantIds, 'rentcall_last_reminder', LOCA.currentYear, LOCA.currentMonth, status => {
                    bootbox.alert(this.emailStatus({results: status}), () => {
                        this.closeForm(() => {
                            this.loadList();
                        });
                    });
                });
            });
            return false;
        });

        $(document).on('click', '#view-rent #printinvoices', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/print/invoice/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-rent #rentcall', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/print/rentcall/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-rent #recovery1', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/print/recovery1/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-rent #recovery2', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/print/recovery2/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-rent #recovery3', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/print/recovery3/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-rent #paymentorder', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/print/paymentorder/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-rent .js-rent-period', function() {
            const $monthPicker = $('#view-rent .js-month-picker');
            if ($monthPicker.is(':visible')) {
                $monthPicker.hide();
            } else {
                $monthPicker.show();
            }
            return false;
        });
    }

    // callback
    onUserAction($action, actionId) {
        const selection = this.list.getSelectedData();

        if (actionId==='list-action-pay-rent') {
            const rent = selection[0];
            this.form.bindForm();
            this.form.setData(rent);
            if (rent.occupant.terminated) {
                $('#rent-payment-form select').attr('readonly', true).attr('disabled', true).addClass('uneditable-input');
                $('#rent-payment-form input').attr('readonly', true).addClass('uneditable-input');
                $('#rent-payment-form textarea').attr('readonly', true).addClass('uneditable-input');
                this.openForm('pay-rent-form', 'pay-rent-view-menu');
            } else {
                this.openForm('pay-rent-form', 'pay-rent-edit-menu');
            }
        }
        else if (actionId==='list-action-edit-pay-rent') {
            $('#rent-payment-form select').attr('readonly', false).attr('disabled', false).removeClass('uneditable-input');
            $('#rent-payment-form input').attr('readonly', false).attr('disabled', false).removeClass('uneditable-input');
            $('#rent-payment-form textarea').attr('readonly', false).removeClass('uneditable-input');
            this.showMenu('pay-rent-edit-menu');
        }
        else if (actionId==='list-action-edit-occupant') {
            $('#occupant-form select').attr('readonly', false).attr('disabled', false).removeClass('uneditable-input');
            $('#occupant-form input').attr('readonly', false).attr('disabled', false).removeClass('uneditable-input');
            $('#occupant-form .btn').removeClass('hidden');
            this.showMenu('pay-rent-edit-menu');
        }
        else if (actionId==='list-action-rents-history') {
            $('#history-rents-table').html('');
            this.openForm('rents-history', null, () => {
                application.httpGet(
                    `/api/rents/occupant/${selection[0]._id}`,
                    (req, res) => {
                        const rentsHistory = JSON.parse(res.responseText);
                        $('#history-rents-table').html(this.templateHistoryRents(rentsHistory));
                        this.scrollToElement('#history-rents-table .active');
                    }
                );
            });
        }
        else if (actionId==='list-action-print') {
            this.openForm('print-doc-selector');
        }
        else if (actionId==='list-action-email') {
            this.openForm('email-doc-selector');
        }
        else if (actionId==='list-action-save-form') {
            this.form.submit((data) => {
                this.closeForm(() => {
                    application.httpGet(
                        `/api/rents/overview/${LOCA.currentYear}/${LOCA.currentMonth}`,
                        (req, res) => {
                            const rentsOverview = JSON.parse(res.responseText);
                            const countAll = rentsOverview.countAll;
                            const countPaid = rentsOverview.countPaid;
                            const countPartiallyPaid = rentsOverview.countPartiallyPaid;
                            const countNotPaid = rentsOverview.countNotPaid;
                            const totalToPay = rentsOverview.totalToPay;
                            const totalNotPaid = rentsOverview.totalNotPaid;
                            const totalPaid = rentsOverview.totalPaid;
                            $('.js-all-filter-label').html('('+countAll+')');
                            $('.js-paid-filter-label').html('('+(countPaid + countPartiallyPaid)+')');
                            $('.js-not-paid-filter-label').html('('+countNotPaid+')');
                            //$('.partially-js-paid-filter-label').html(countPartiallyPaid);
                            $('.js-total-topay').html(Helper.formatMoney(totalToPay));
                            $('.js-total-notpaid').html(Helper.formatMoney(totalNotPaid));
                            $('.js-total-paid').html(Helper.formatMoney(totalPaid));

                            this.list.update(data);
                            this.list.showAllRows( );
                        });
                });
            });
        }
    }

    // callback
    onDataChanged() {
        const self = this;
        const $monthPicker = $('#view-rent .js-month-picker');
        $monthPicker.datepicker({
            language: LOCA.countryCode,
            autoclose: true,
            format: 'MM yyyy',
            startView: 1,
            minViewMode: 1
        });

        $monthPicker.datepicker('setDate', moment('01/'+LOCA.currentMonth+'/'+LOCA.currentYear, 'DD/MM/YYYY').toDate());
        $('#view-rent .js-rent-period').html(Helper.formatMonthYear(LOCA.currentMonth, LOCA.currentYear).toUpperCase());
        $monthPicker.on('changeDate', function() {
            const selection = moment($(this).datepicker('getDate'));
            LOCA.currentYear = selection.get('year');
            LOCA.currentMonth = selection.get('month')+1;
            $monthPicker.hide();
            $('#view-rent .js-rent-period').html(Helper.formatMonthYear(LOCA.currentMonth, LOCA.currentYear).toUpperCase()).show();
            self.loadList();
        });
    }

    // overriden
    exited() {
        this.form.unbindForm();
    }
}

export default RentMiddleware;
