import $ from 'jquery';
import i18next from 'i18next';
import Form from '../common/form';

class OwnerForm extends Form {

    constructor() {
        super({
            alertOnFieldError: true
        });
    }

    // METHODS TO OVERRIDE
    getDomSelector() {
        return '#owner-form';
    }

    // Only one owner
    getAddUrl() {
        return this.getUpdateUrl();
    }

    getUpdateUrl() {
        return '/owner/update';
    }

    getDefaultData() {
        return {
            _id: '',
            isCompany: false,
            company: '',
            legalForm: '',
            siret: '',
            capital: '',
            vatNumber: '',
            manager: '',
            street1: '',
            street2: '',
            zipCode: '',
            city: '',
            contact: '',
            phone1: '',
            phone2: '',
            email: '',
            bank: '',
            rib: ''
        };
    }

    getManifest() {
        return {
            'isCompany': {
                required: true
            },
            'manager': {
                required: true,
                minlength: 2
            },
            'company': {
                minlength: 2,
                required: {
                    depends: () => $(this.getDomSelector() + ' #isCompany option:selected').val()==='company'
                }
            },
            'legalForm': {
                minlength: 2,
                required: {
                    depends: () => $(this.getDomSelector() + ' #isCompany option:selected').val()==='company'
                }
            },
            'siret': {
                minlength: 2,
                required: {
                    depends: () => $(this.getDomSelector() + ' #isCompany option:selected').val()==='company'
                }
            },
            'capital': {
                number: true,
                min: 0,
                required: {
                    depends: () => $(this.getDomSelector() + ' #isCompany option:selected').val()==='company'
                }
            },
            'street1': {
                required: true,
                minlength: 2
            },
            'zipCode': {
                required: true,
                minlength: 2
            },
            'city': {
                required: true,
                minlength: 2
            },
            'contact': {
                required: true,
                minlength: 2
            },
            'phone1': {
                phoneFR: true
            },
            'phone2': {
                phoneFR: true
            },
            'email': {
                required: true,
                email: true
            },
            'bank': {
                minlength: 2
            },
            'rib': {
                minlength: 2
            }
        };
    }

    onGetData(data) {
        if (!data.isCompany) {
            data.company = null;
            data.legalForm = null;
            data.siret = null;
            data.capital = null;
            data.vatNumber = null;
        }

        return data;
    }

    afterSetData(/*args*/) {
        this._companyChanged(this.getDomSelector(), $(this.getDomSelector() + ' #isCompany'));
    }

    onBind() {
        const that = this;
        $(this.getDomSelector() + ' #isCompany').change(function() {
            that._companyChanged(that.getDomSelector(), $(this));
        });
    }

    //----------------------------------------
    // Helpers
    //----------------------------------------
    _companyChanged(domSelector, $select) {
        const selection = $select.find(':selected').val();
        if (selection === 'true') {
            $(domSelector + ' .private-fields').hide();
            $(domSelector + ' .company-fields').show();
            $(domSelector + ' #manager-label').html(i18next.t('Effective manager (first and last name)'));
        }
        else {
            $(domSelector + ' .company-fields').hide();
            $(domSelector + ' .private-fields').show();
            $(domSelector + ' #manager-label').html(i18next.t('First and last name'));
        }
    }
}

export default OwnerForm;
