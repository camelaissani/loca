import $ from 'jquery';
import moment from 'moment';
import i18next from 'i18next';
import Form from '../../lib/form';
import {LOCA} from '../../lib/main';

class PaymentForm extends Form {

    constructor() {
        super({
            alertOnFieldError: true
        });
    }

    // METHODS TO OVERRIDE
    getDomSelector() {
        return '#rent-payment-form';
    }

    // No add possibility
    // getAddUrl() {
    //     return '/api/properties';
    // };

    getUpdateUrl() {
        return '/api/rents';
    }

    getDefaultData() {
        return {
            _id: '',
            month: '',
            year: '',
            payment: '',
            paymentType: '',
            paymentReference: '',
            paymentDate: '',
            description: '',
            promo: '',
            notepromo: ''
        };
    }

    beforeSetData(args) {
        const payment = args[0];
        if (!payment.payment) {
            payment.payment= '';
        }
        if (!payment.promo) {
            payment.promo= '';
        }

        if (payment.paymentDate) {
            payment.paymentDate = moment(payment.paymentDate, 'DD/MM/YYYY').format(i18next.t('__fmt_date__')); //db formtat to display one
        }
    }

    afterSetData(args) {
        const payment = args[0],
            paymentPeriod = moment.months()[payment.month-1] + ' ' + payment.year;

        $(this.getDomSelector() + ' #occupantNameLabel').html(payment.occupant.name);
        $(this.getDomSelector() + ' #paymentPeriod').html(paymentPeriod);
    }

    onGetData(data) {
        if (data.paymentDate) {
            data.paymentDate = moment(data.paymentDate, i18next.t('__fmt_date__')).format('DD/MM/YYYY'); //display format to db one
        }
        return data;
    }


    getManifest() {
        const period = moment.months()[Number(LOCA.currentMonth)-1],
            minDate = moment({day:0, month: Number(LOCA.currentMonth)-1, year: Number(LOCA.currentYear)}).startOf('month'),
            maxDate = moment({day:0, month: Number(LOCA.currentMonth)-1, year: Number(LOCA.currentYear)}).endOf('month');
        return {
            'payment': {
                number: true,
                min: 0
            },
            'paymentDate': {
                required: {
                    depends: (/*element*/) => {
                        const amount = Number($(this.getDomSelector() + ' #payment').val());
                        return amount>0;
                    }
                },
                fdate: [i18next.t('__fmt_date__')],
                mindate: [{
                    minDate: minDate,
                    message: i18next.t('Only the payment of rent period are authorized. Please enter a date between', {period: period, minDate: minDate.format(i18next.t('__fmt_date__')), maxDate: maxDate.format(i18next.t('__fmt_date__'))})
                }],
                maxdate: [{
                    maxDate: maxDate,
                    message: i18next.t('Only the payment of rent period are authorized. Please enter a date between', {period: period, minDate: minDate.format(i18next.t('__fmt_date__')), maxDate: maxDate.format(i18next.t('__fmt_date__'))})
                }]
            },
            'paymentType': {
                required: {
                    depends: (/*element*/) => {
                        const amount = Number($(this.getDomSelector() + ' #payment').val());
                        return amount>0;
                    }
                }
            },
            'paymentReference': {
                required: {
                    depends: (/*element*/) => {
                        const ref = $(this.getDomSelector() + ' #paymentType').val();
                        return (ref && ref!=='cash');
                    }
                }
            },
            'promo': {
                number: true,
                min: 0
            },
            'notepromo': {
                minlength: 2,
                required: {
                    depends: (/*element*/) => {
                        const amount = Number($(this.getDomSelector() + ' #promo').val());
                        return amount>0;
                    }
                }
            }
        };
    }
}

export default PaymentForm;
