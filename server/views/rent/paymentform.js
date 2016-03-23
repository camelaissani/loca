LOCA.PaymentForm = (function($, moment, i18next) {

    function PaymentForm() {
        LOCA.Form.call(this, {
            alertOnFieldError: true
        });
    }

    // SUBOBJECT OF FORM
    PaymentForm.prototype = Object.create(LOCA.Form.prototype);
    PaymentForm.prototype.constructor = PaymentForm;

    // METHODS TO OVERRIDE
    PaymentForm.prototype.getDomSelector = function() {
        return '#rent-payment-form';
    };

    // No add possibility
    // PaymentForm.prototype.getAddUrl = function() {
    //     return '/properties/add';
    // };

    PaymentForm.prototype.getUpdateUrl = function() {
        return '/rents/update';
    };

    PaymentForm.prototype.getDefaultData = function() {
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
    };

    PaymentForm.prototype.beforeSetData = function(args) {
        var payment = args[0];
        if (!payment.payment) {
            payment.payment= '';
        }
        if (!payment.promo) {
            payment.promo= '';
        }

        if (payment.paymentDate) {
            payment.paymentDate = moment(payment.paymentDate, 'DD/MM/YYYY').format(i18next.t('__fmt_date__')); //db formtat to display one
        }
    };

    PaymentForm.prototype.afterSetData = function(args) {
        var payment = args[0],
            paymentPeriod;

        paymentPeriod = moment.months()[payment.month-1] + ' ' + payment.year;
        $(this.getDomSelector() + ' #occupantNameLabel').html(payment.occupant.name);
        $(this.getDomSelector() + ' #paymentPeriod').html(paymentPeriod);
    };

    PaymentForm.prototype.onGetData = function(data) {
        if (data.paymentDate) {
            data.paymentDate = moment(data.paymentDate, i18next.t('__fmt_date__')).format('DD/MM/YYYY'); //display format to db one
        }
        return data;
    };


    PaymentForm.prototype.getManifest = function() {
        var self = this;
        return {
            'payment': {
                number: true,
                min: 0
            },
            'paymentDate': {
                required: {
                    depends: function(/*element*/) {
                        var amount = Number($(self.getDomSelector() + ' #payment').val());
                        return amount>0;
                    }
                },
                fdate: [i18next.t('__fmt_date__')]
            },
            'paymentType': {
                required: {
                    depends: function(/*element*/) {
                        var amount = Number($(self.getDomSelector() + ' #payment').val());
                        return amount>0;
                    }
                }
            },
            'paymentReference': {
                required: {
                    depends: function(/*element*/) {
                        var ref = $(self.getDomSelector() + ' #paymentType').val();
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
                    depends: function(/*element*/) {
                        var amount = Number($(self.getDomSelector() + ' #promo').val());
                        return amount>0;
                    }
                }
            }
        };
    };

    return PaymentForm;
})(window.$, window.moment, window.i18next);
