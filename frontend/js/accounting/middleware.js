import Handlebars from 'handlebars';
import moment from 'moment';
import application from '../application';
import ViewController from '../viewcontroller';

const LOCA = application.get('LOCA');

class AccountingMiddleware extends ViewController {

    constructor() {
        super({
            domViewId: '#view-accounting',
            defaultMenuId: 'accounting-menu'
        });
        this.year = LOCA.currentYear;
    }

    onInitListener() {
        $(document).on('click', '#view-accounting .accounting-period', function() {
            const $yearPicker = $('#view-accounting .js-year-picker');
            if ($yearPicker.is(':visible')) {
                $yearPicker.hide();
            } else {
                $yearPicker.show();
            }
            return false;
        });
    }

    onInitTemplate() {
        // Handlebars templates
        Handlebars.registerPartial('accounting-payments-row-template', $('#accounting-payments-row-template').html());

        this.templatePaymentsTable = Handlebars.compile($('#accounting-payments-template').html());
        this.templateEntriesExitsTable = Handlebars.compile($('#accounting-entries-exits-template').html());
    }

    onDataChanged(callback) {
        const $yearPicker = $('#view-accounting .js-year-picker');
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
            let url = `/print/invoice/occupants/${occupantId}/${year}`;
            if (month) {
                url += `/${month}`;
            }
            application.openPrintPreview(url);
        }
    }

    load(callback) {
        application.httpGet(
            `/api/accounting/${this.year}`,
            (req, res) => {
                const data = JSON.parse(res.responseText);
                data.payments.months = moment.months();
                $('#view-accounting #accounting-payments-table').html(this.templatePaymentsTable(data.payments));
                $('#view-accounting #accounting-entries-exits-table').html(this.templateEntriesExitsTable(data.entriesExists));
                $('#view-accounting #accounting-payments-fake-table').width($('#view-accounting #accounting-payments-per-year-table').outerWidth());

                // bind top horizontal scrollbar with table
                const $topHScroll = $('#view-accounting #accounting-payments-table-top-hscroll');
                const $viewScroll = $('#view-accounting #accounting-payments-per-year-table').parent();
                $topHScroll.off('.topHscroll');
                $viewScroll.off('.topHscroll');
                $topHScroll.on('scroll.topHScroll', () => {
                    $viewScroll.scrollLeft($topHScroll.scrollLeft());
                });
                $viewScroll.on('scroll.topHScroll', () => {
                    $topHScroll.scrollLeft($viewScroll.scrollLeft());
                });
                if (callback) {
                    callback();
                }
            }
        );
    }
}

export default AccountingMiddleware;
