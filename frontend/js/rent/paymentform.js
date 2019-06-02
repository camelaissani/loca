import $ from 'jquery';
import moment from 'moment';
import i18next from 'i18next';
import application from '../application';
import Form from '../form';
import Helper from '../lib/helper';

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
                'extracharge': {
                    number: true,
                    min: 0
                },
                'noteextracharge': {
                    minlength: 2,
                    required: {
                        depends: (/*element*/) => {
                            const amount = Number($(domSelector + ' #extracharge').val());
                            return amount>0;
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
                extracharge: '',
                noteextracharge: '',
                promo: '',
                notepromo: ''
            }
        });
    }

    beforeSetData(args) {
        const rent = args[0];
        const { occupant } = rent;

        if (occupant.terminated) {
            $(`${domSelector} .js-lease-state`).removeClass('hidden');
            $(`${domSelector} .js-contract-termination-date`).html(Helper.formatDate(occupant.terminationDate));
            const { mindate, maxdate, ...paymentDate } = this.validator.settings.rules.paymentDate;
            this.validator.settings.rules.paymentDate = paymentDate;
        } else {
            $(`${domSelector} .js-lease-state`).addClass('hidden');
        }

        if (!rent.payment) {
            rent.payment= '';
        }

        if (!rent.promo) {
            rent.promo= '';
        }

        if (!rent.extracharge) {
            rent.extracharge= '';
        }

        if (rent.paymentDate) {
            rent.paymentDate = moment(rent.paymentDate, 'DD/MM/YYYY').format('L'); //db formtat to display one
        }
    }

    afterSetData(args) {
        const rent = args[0],
            paymentPeriod = moment.months()[rent.month-1] + ' ' + rent.year;

        $(domSelector + ' #occupantNameLabel').html(rent.occupant.name);
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
