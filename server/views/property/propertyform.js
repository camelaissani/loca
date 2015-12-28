LOCA.PropertyForm = (function($) {

    function PropertyForm() {
        LOCA.Form.call(this, {
            alertOnFieldError: true
        });
    }

    // SUBOBJECT OF FORM
    PropertyForm.prototype = Object.create(LOCA.Form.prototype);
    PropertyForm.prototype.constructor = PropertyForm;

    // METHODS TO OVERRIDE
    PropertyForm.prototype.getDomSelector = function() {
        return '#property-form';
    };

    PropertyForm.prototype.getAddUrl = function() {
        return '/properties/add';
    };

    PropertyForm.prototype.getUpdateUrl = function() {
        return '/properties/update';
    };

    PropertyForm.prototype.getDefaultData = function() {
        return {
            _id: '',
            type: 'office',
            name: '',
            description: '',
            surface: '',
            phone: '',
            building: '',
            level: '',
            location: '',
            price: '',
            expense: ''
        };
    };

    PropertyForm.prototype.getManifest = function() {
        var self = this;
        return {
            'type': {
                required: true
            },
            'name': {
                required: true,
                minlength: 2
            },
            'surface': {
                number: true,
                min: 0
            },
            'phone': {
                phoneFR: true
            },
            'price': {
                required: true,
                number: true,
                min: 0
            },
            'expense': {
                required: {
                    depends: function() {
                        var type = $(self.getDomSelector() + ' #type').val();
                        return (type==='office');
                    }
                },
                number: true,
                min: 0
            }
        };
    };

    PropertyForm.prototype.beforeSetData = function(args) {
        var property = args[0];
        if (property) {
            if (!property.phone) {
                property.phone = '';
            }
            if (!property.surface) {
                property.surface = '';
            }
            if (!property.expense) {
                property.expense = '';
            }
        }
    };

    PropertyForm.prototype.afterSetData = function(args) {
        var property = args[0];

        if (property && property._id) {
            $(this.getDomSelector() + ' #propertyNameLabel').html(property.name);
            $('.user-action[data-id="list-action-remove-property"]').show();
        }
        else {
            $(this.getDomSelector() + ' #propertyNameLabel').html('Bien à louer');
            $('.user-action[data-id="list-action-remove-property"]').hide();
        }

        typeChanged($(this.getDomSelector()+ ' #type'));
        computeRent(this);
    };

    PropertyForm.prototype.onBind = function() {
        var self = this;

        $(this.getDomSelector() + ' #type').change(function() {
            typeChanged($(this));
        });

        $(this.getDomSelector() + ' #price').keyup(function() {
            computeRent(self);
        });
    };

    //----------------------------------------
    // Helpers
    //----------------------------------------
    function typeChanged($select) {
        var selection = $select.find(':selected').val();
        if (selection !== 'office') {
            $('.property-no-expense').hide();
        }
        else {
            $('.property-no-expense').show();
        }
    }

    function computeRent(form) {
        var data = form.getData();
        var rentWithExpenses = Number(data.price) + Number(data.expense);

        $('#property-form-summary-rent').html(LOCA.formatMoney(data.price, false, false));
        $('#property-form-summary-expense').html(LOCA.formatMoney(data.expense, false, false));
        $('#property-form-summary-totla-rentwithexpenses').html(LOCA.formatMoney(rentWithExpenses, false, false));
    }

    return PropertyForm;
})(window.$);
