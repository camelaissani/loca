import $ from 'jquery';
import moment from 'moment';
import Handlebars from 'handlebars';
import {LOCA} from '../../lib/main';
import ViewController from '../../lib/_viewcontroller';
import requester from '../../lib/requester';
import application from '../../lib/application';
import Helper from '../../lib/helper';
import PaymentForm from './paymentform';

class RentCtrl extends ViewController {

    // RentCtrl extends Controller
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

    loadList(callback) {
        requester.ajax({
            type: 'GET',
            url: `/api/rents/overview/${LOCA.currentYear}/${LOCA.currentMonth}`
        },
        (rentsOverview) => {
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

            requester.ajax({
                type: 'GET',
                url: `/api/rents/${LOCA.currentYear}/${LOCA.currentMonth}`
            },
            (jsonRents) => {
                this.list.init({rows: jsonRents});
                if (callback) {
                    callback();
                }
            });
        });
    }

    onInitTemplates() {
        // Handlebars templates
        Handlebars.registerPartial('history-rent-row-template', $('#history-rent-row-template').html());
        Handlebars.registerPartial('view-rent-payment-badges-template', $('#view-rent-payment-badges-template').html());

        this.templateHistoryRents = Handlebars.compile($('#history-rents-template').html());

        const $rentsSelected = $('#view-rent-selected-list-template');
        if ($rentsSelected.length >0) {
            this.templateSelectedRow = Handlebars.compile($rentsSelected.html());
        }
    }

    onInitListeners() {
        $(document).on('click', '#view-rent #printinvoices', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/invoice/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-rent #rentcall', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/rentcall/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-rent #recovery1', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/recovery1/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-rent #recovery2', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/recovery2/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-rent #recovery3', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/recovery3/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
            return false;
        });

        $(document).on('click', '#view-rent #paymentorder', () => {
            const selection = this.getSelectedIds();
            application.openPrintPreview(`/api/documents/print/paymentorder/occupants/${selection}/${LOCA.currentYear}/${LOCA.currentMonth}`);
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

    onUserAction($action, actionId) {
        const selection = this.list.getSelectedData();

        if (actionId==='list-action-pay-rent') {
            this.form.bindForm();
            this.form.setData(selection[0]);
            this.openForm('pay-rent-form');
        }
        else if (actionId==='list-action-rents-history') {
            $('#history-rents-table').html('');
            requester.ajax({
                type: 'GET',
                url: `/api/rents/occupant/${selection[0]._id}`
            },
            (rentsHistory) => {
                $('#history-rents-table').html(this.templateHistoryRents(rentsHistory));
                this.scrollToVisible('#renttable .active');
            });
            this.openForm('rents-history', true);
        }
        else if (actionId==='list-action-print') {
            this.openForm('print-doc-selector');
        }
        else if (actionId==='list-action-save-form') {
            this.form.submit((data) => {
                this.closeForm(() => {
                    requester.ajax({
                        type: 'GET',
                        url: `/api/rents/overview/${LOCA.currentYear}/${LOCA.currentMonth}`
                    },
                    (rentsOverview) => {
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
                        this.list.showAllRows(() => {
                            this.scrollToVisible();
                        });
                    });
                });
            });
        }
    }

    onDataChanged(callback) {
        const that = this;
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
            that.loadList();
        });

        if (callback) {
            callback();
        }
    }
}

export default new RentCtrl();
