import $ from 'jquery';
import moment from 'moment';
import i18next from 'i18next';
import application from '../application';
import Form from '../form';

const LOCA = application.get('LOCA');
const domSelector = '#rent-payment-form';
const minDate = () => moment({day:0, month: Number(LOCA.currentMonth)-1, year: Number(LOCA.currentYear)}).startOf('month');
const maxDate = () => moment({day:0, month: Number(LOCA.currentMonth)-1, year: Number(LOCA.currentYear)}).endOf('month');
const period = () => moment.months()[Number(LOCA.currentMonth)-1];

class PaymentForm extends Form {

    constructor() {
        super({
            domSelector,
            uri: '/api/rents',
            manifest: {
                'payment': {
                    number: true,
                    min: 0
                },
                'paymentDate': {
                    required: {
                        depends: (/*element*/) => {
                            const amount = Number($(domSelector + ' #payment').val());
                            return amount>0;
                        }
                    },
                    date: true,
                    mindate: [{
                        minDate,
                        message: i18next.t('Only the payment of rent period are authorized. Please enter a date between', {period: period(), minDate: minDate().format('L'), maxDate: maxDate().format('L')})
                    }],
                    maxdate: [{
                        maxDate,
                        message: i18next.t('Only the payment of rent period are authorized. Please enter a date between', {period: period(), minDate: minDate().format('L'), maxDate: maxDate().format('L')})
                    }]
                },
                'paymentType': {
                    required: {
                        depends: (/*element*/) => {
                            const amount = Number($(domSelector + ' #payment').val());
                            return amount>0;
                        }
                    }
                },
                'paymentReference': {
                    required: {
                        depends: (/*element*/) => {
                            const ref = $(domSelector + ' #paymentType').val();
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
                            const amount = Number($(domSelector + ' #promo').val());
                            return amount>0;
                        }
                    }
                }
            },
            defaultData: {
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
            }
        });
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
            payment.paymentDate = moment(payment.paymentDate, 'DD/MM/YYYY').format('L'); //db formtat to display one
        }
    }

    afterSetData(args) {
        const payment = args[0],
            paymentPeriod = moment.months()[payment.month-1] + ' ' + payment.year;

        $(domSelector + ' #occupantNameLabel').html(payment.occupant.name);
        $(domSelector + ' #paymentPeriod').html(paymentPeriod);
    }

    onGetData(data) {
        if (data.paymentDate) {
            data.paymentDate = moment(data.paymentDate, 'L').format('DD/MM/YYYY'); //display format to db one
        }
        return data;
    }
}

export default PaymentForm;
