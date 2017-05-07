import $ from 'jquery';
import i18next from 'i18next';
import Form from '../../lib/form';
import Helper from '../../lib/helper';

class PropertyForm extends Form {

    constructor() {
        super({
            alertOnFieldError: true
        });
    }

    // METHODS TO OVERRIDE
    getDomSelector() {
        return '#property-form';
    }

    getAddUrl() {
        return '/api/properties';
    }

    getUpdateUrl() {
        return '/api/properties';
    }

    getDefaultData() {
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
    }

    getManifest() {
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
                    depends: () => {
                        const type = $(this.getDomSelector() + ' #type').val();
                        return (type==='office');
                    }
                },
                number: true,
                min: 0
            }
        };
    }

    beforeSetData(args) {
        const property = args[0];
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
    }

    afterSetData(args) {
        const property = args[0];

        if (property && property._id) {
            $(this.getDomSelector() + ' #propertyNameLabel').html(property.name);
            $('.js-user-action[data-id="list-action-remove-property"]').show();
        }
        else {
            $(this.getDomSelector() + ' #propertyNameLabel').html(i18next.t('Property to rent'));
            $('.js-user-action[data-id="list-action-remove-property"]').hide();
        }

        this._typeChanged($(this.getDomSelector()+ ' #type'));
        this._computeRent();
    }

    onBind() {
        const that = this;

        $(this.getDomSelector() + ' #type').change(function() {
            that._typeChanged($(this));
        });

        $(this.getDomSelector() + ' #price').keyup(() => {
            this._computeRent();
        });
    }

    //----------------------------------------
    // Helpers
    //----------------------------------------
    _typeChanged($select) {
        const selection = $select.find(':selected').val();
        if (selection !== 'office') {
            $('.property-no-expense').hide();
        }
        else {
            $('.property-no-expense').show();
        }
    }

    _computeRent() {
        const data = this.getData();
        const rentWithExpenses = Number(data.price) + Number(data.expense);

        $('#property-form-summary-rent').html(Helper.formatMoney(data.price, false, false));
        $('#property-form-summary-expense').html(Helper.formatMoney(data.expense, false, false));
        $('#property-form-summary-totla-rentwithexpenses').html(Helper.formatMoney(rentWithExpenses, false, false));
    }

}

export default PropertyForm;
