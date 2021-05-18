import $ from 'jquery';
import moment from 'moment';
import i18next from 'i18next';
import application from '../application';
import Form from '../form';
import Helper from '../lib/helper';

const LOCA = application.get('LOCA');
const domSelector = '#rent-payment-form';
const minDate = () =>
  moment({
    day: 0,
    month: Number(LOCA.currentMonth) - 1,
    year: Number(LOCA.currentYear),
  }).startOf('month');
const maxDate = () =>
  moment({
    day: 0,
    month: Number(LOCA.currentMonth) - 1,
    year: Number(LOCA.currentYear),
  }).endOf('month');
const period = () => moment.months()[Number(LOCA.currentMonth) - 1];

class PaymentForm extends Form {
  constructor() {
    super({
      domSelector,
      uri: '/api/rents',
      manifest: {
        paymentAmount_0: {
          number: true,
          min: 0,
        },
        paymentDate_0: {
          required: {
            depends: (/*element*/) => {
              const amount = Number($(domSelector + ' #paymentAmount_0').val());
              return amount > 0;
            },
          },
          date: true,
          mindate: [
            {
              minDate,
              message: i18next.t(
                'Only the payment of rent period are authorized. Please enter a date between',
                {
                  period: period(),
                  minDate: minDate().format('L'),
                  maxDate: maxDate().format('L'),
                }
              ),
            },
          ],
          maxdate: [
            {
              maxDate,
              message: i18next.t(
                'Only the payment of rent period are authorized. Please enter a date between',
                {
                  period: period(),
                  minDate: minDate().format('L'),
                  maxDate: maxDate().format('L'),
                }
              ),
            },
          ],
        },
        paymentType_0: {
          required: {
            depends: (/*element*/) => {
              const amount = Number($(domSelector + ' #paymentAmount_0').val());
              return amount > 0;
            },
          },
        },
        paymentReference_0: {
          required: {
            depends: (/*element*/) => {
              const amount = Number($(domSelector + ' #paymentAmount_0').val());
              const ref = $(domSelector + ' #paymentType_0').val();
              return amount > 0 && ref && ref !== 'cash';
            },
          },
        },
        extracharge: {
          number: true,
          min: 0,
        },
        noteextracharge: {
          minlength: 2,
          required: {
            depends: (/*element*/) => {
              const amount = Number($(domSelector + ' #extracharge').val());
              return amount > 0;
            },
          },
        },
        promo: {
          number: true,
          min: 0,
        },
        notepromo: {
          minlength: 2,
          required: {
            depends: (/*element*/) => {
              const amount = Number($(domSelector + ' #promo').val());
              return amount > 0;
            },
          },
        },
      },
      defaultData: {
        _id: '',
        month: '',
        year: '',
        payments: [
          {
            paymentAmount: '',
            paymentType: '',
            paymentReference: '',
            paymentDate: '',
          },
        ],
        description: '',
        extracharge: '',
        noteextracharge: '',
        promo: '',
        notepromo: '',
      },
    });
  }

  beforeSetData(args) {
    const rent = args[0];
    const { occupant } = rent;

    this.paymentRowCount = 0;

    if (occupant.terminated) {
      $(`${domSelector} .js-lease-state`).removeClass('hidden');
      $(`${domSelector} .js-contract-termination-date`).html(
        Helper.formatDate(occupant.terminationDate)
      );
      const { mindate, maxdate, ...paymentDate } =
        this.validator.settings.rules.paymentDate;
      this.validator.settings.rules.paymentDate = paymentDate;
    } else {
      $(`${domSelector} .js-lease-state`).addClass('hidden');
    }

    if (rent.payments) {
      rent.payments = rent.payments.map(
        ({ date, amount, type, reference }) => ({
          paymentDate: date ? moment(date, 'DD/MM/YYYY').format('L') : '', // db format date to local format
          paymentAmount: amount,
          paymentType: type,
          paymentReference: reference,
        })
      );
      if (rent.payments.length > 1) {
        for (let i = 1; i < rent.payments.length; i++) {
          this.addPaymentRow();
        }
      }
    }

    if (!rent.promo) {
      rent.promo = '';
    }

    if (!rent.extracharge) {
      rent.extracharge = '';
    }
  }

  afterSetData(args) {
    const rent = args[0],
      paymentPeriod = moment.months()[rent.month - 1] + ' ' + rent.year;

    $(domSelector + ' #occupantNameLabel').html(rent.occupant.name);
    $(domSelector + ' #paymentPeriod').html(paymentPeriod);
  }

  onGetData(data) {
    if (data.payments) {
      data.payments = data.payments
        .filter(
          ({ paymentAmount }) => paymentAmount && Number(paymentAmount) > 0
        )
        .map(
          ({ paymentDate, paymentAmount, paymentType, paymentReference }) => ({
            date: paymentDate
              ? moment(paymentDate, 'L').format('DD/MM/YYYY')
              : '', // local format date to db format
            amount: Number(paymentAmount),
            type: paymentType,
            reference: paymentReference,
          })
        );
    }
    return data;
  }

  onBind() {
    const self = this;
    // Dynamic payment rows
    $(domSelector + ' #btn-add-payment')
      .off('click')
      .click(() => {
        this.addPaymentRow();
        this.formHasBeenUpdated();
        return false;
      });

    // Remove dynamic rows
    $(domSelector + ' .js-btn-form-remove-row')
      .off('click')
      .click(function () {
        var $row = $(this).parents('.js-form-row');
        $row.remove();
        self.formHasBeenUpdated();
        return false;
      });

    $(domSelector + ' .js-master-form-row .js-btn-form-remove-row').hide();
  }

  addPaymentRow() {
    this.paymentRowCount++;
    $(domSelector + ' #payments .js-master-form-row .datepicker').datepicker(
      'destroy'
    );
    const $newRow = $(domSelector + ' #payments .js-master-form-row')
      .clone(true)
      .removeClass('js-master-form-row');
    $('.has-error', $newRow).removeClass('has-error');
    $('label.error', $newRow).remove();
    const paymentAmount = 'paymentAmount_' + this.paymentRowCount;
    const paymentType = 'paymentType_' + this.paymentRowCount;
    const paymentDate = 'paymentDate_' + this.paymentRowCount;
    const paymentReference = 'paymentReference_' + this.paymentRowCount;

    $('#paymentAmount_0', $newRow)
      .attr('id', paymentAmount)
      .attr('name', paymentAmount)
      .val('');
    $('#paymentType_0', $newRow)
      .attr('id', paymentType)
      .attr('name', paymentType)
      .val('');
    $('#paymentDate_0', $newRow)
      .attr('id', paymentDate)
      .attr('name', paymentDate)
      .val('');
    $('#paymentReference_0', $newRow)
      .attr('id', paymentReference)
      .attr('name', paymentReference)
      .val('');
    $('.js-btn-form-remove-row', $newRow).show();

    // Add new payment row in DOM
    $(domSelector + ' #payments').append($newRow);

    //Add jquery validation rules for new added fields
    $('#' + paymentAmount, $newRow).rules('add', {
      number: true,
      min: 0,
    });

    $('#' + paymentType, $newRow).rules('add', {
      required: {
        depends: (/*element*/) => {
          const amount = Number($(domSelector + ' #' + paymentAmount).val());
          return amount > 0;
        },
      },
    });

    $('#' + paymentDate, $newRow).rules('add', {
      required: {
        depends: () => {
          const amount = Number($(domSelector + ' #' + paymentAmount).val());
          return amount > 0;
        },
      },
      date: true,
      mindate: [
        {
          minDate,
          message: i18next.t(
            'Only the payment of rent period are authorized. Please enter a date between',
            {
              period: period(),
              minDate: minDate().format('L'),
              maxDate: maxDate().format('L'),
            }
          ),
        },
      ],
      maxdate: [
        {
          maxDate,
          message: i18next.t(
            'Only the payment of rent period are authorized. Please enter a date between',
            {
              period: period(),
              minDate: minDate().format('L'),
              maxDate: maxDate().format('L'),
            }
          ),
        },
      ],
    });

    $('#' + paymentReference, $newRow).rules('add', {
      required: {
        depends: (/*element*/) => {
          const ref = $(domSelector + ' #' + paymentType).val();
          const amount = Number($(domSelector + ' #' + paymentAmount).val());
          return amount > 0 && ref && ref !== 'cash';
        },
      },
    });
  }
}

export default PaymentForm;
