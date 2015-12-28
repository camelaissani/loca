LOCA.PaymentForm = (function($) {

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
    };

    PaymentForm.prototype.afterSetData = function(args) {
        var payment = args[0];

        $(this.getDomSelector() + ' #occupantNameLabel').html(payment.occupant.name);
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
                fdate: ['DD/MM/YYYY']
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
})(window.$);