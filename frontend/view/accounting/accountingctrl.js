import Handlebars from 'handlebars';
import moment from 'moment';
import requester from '../../lib/requester';
import ViewController from '../../lib/_viewcontroller';
import {LOCA} from '../../lib/main';
import application from '../../lib/application';

class AccountingCtrl extends ViewController {

    constructor() {
        super({
            domViewId: '#view-accounting',
            defaultMenuId: 'accounting-menu'
        });
        this.year = LOCA.currentYear;
    }

    onInitListeners() {
        $(document).on('click', '#view-accounting .accounting-period', function() {
            const $yearButton = $(this),
                $yearPicker = $('#view-accounting .year-picker');
            if ($yearPicker.is(':visible')) {
                $yearPicker.hide();
            } else {
                $yearPicker.show();
                if (!$yearButton.hasClass('mobile-view')) {
                    $yearButton.hide();
                }
            }
            return false;
        });
    }

    onInitTemplates() {
        // Handlebars templates
        Handlebars.registerPartial('accounting-payments-row-template', $('#accounting-payments-row-template').html());

        this.templatePaymentsTable = Handlebars.compile($('#accounting-payments-template').html());
        this.templateEntriesExitsTable = Handlebars.compile($('#accounting-entries-exits-template').html());
    }

    onDataChanged(callback) {
        const $yearPicker = $('#view-accounting .year-picker');
        $yearPicker.datepicker({
            language: LOCA.countryCode,
            autoclose: true,
            format: ' yyyy',
            startView: 'years',
            minViewMode: 'years'
        });

        const that = this;
        $yearPicker.on('changeDate', function() {
            const selection = moment($(this).datepicker('getDate'));
            that.year = selection.get('year');
            $yearPicker.hide();
            $('#view-accounting .accounting-period').html(that.year).show();
            that.load();
        });

        $yearPicker.datepicker('setDate', moment('01/01/'+this.year, 'DD/MM/YYYY').toDate());
        $('#view-accounting .accounting-period').html(this.year);
        this.load(callback);
    }

    onUserAction($action, actionId) {
        if (actionId==='invoice-link') {
            const month = $action.data('month');
            const year = $action.data('year');
            const occupantId = $action.data('occupantId');
            let url = `/api/documents/print/invoice/occupants/${occupantId}/${year}`;
            if (month) {
                url += `/${month}`;
            }
            application.openPrintPreview(url);
        }
    }

    load(callback) {
        requester.ajax({
            type: 'GET',
            url: `/api/accounting/${this.year}`
        },
        (data) => {
            data.payments.months = moment.months();
            $('#view-accounting #accounting-payments-table').html(this.templatePaymentsTable(data.payments));
            $('#view-accounting #accounting-entries-exits-table').html(this.templateEntriesExitsTable(data.entriesExists));
            if (callback) {
                callback();
            }
        });
    }
}

export default new AccountingCtrl();
