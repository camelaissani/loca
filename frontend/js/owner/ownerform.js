import $ from 'jquery';
import i18next from 'i18next';
import Form from '../form';

const domSelector = '#owner-form';

class OwnerForm extends Form {

    constructor() {
        super({
            domSelector,
            httpMethod: 'PATCH',
            uri: '/api/owner',
            manifest: {
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
                        depends: () => $(domSelector + ' #isCompany option:selected').val()==='company'
                    }
                },
                'legalForm': {
                    minlength: 2,
                    required: {
                        depends: () => $(domSelector + ' #isCompany option:selected').val()==='company'
                    }
                },
                'siret': {
                    minlength: 2,
                    required: {
                        depends: () => $(domSelector + ' #isCompany option:selected').val()==='company'
                    }
                },
                'capital': {
                    number: true,
                    min: 0,
                    required: {
                        depends: () => $(domSelector + ' #isCompany option:selected').val()==='company'
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
            },
            defaultData: {
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
            }
        });
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
        this._companyChanged($(domSelector + ' #isCompany'));
    }

    onBind() {
        const that = this;
        $(domSelector + ' #isCompany').change(function() {
            that._companyChanged($(this));
        });
    }

    //----------------------------------------
    // Helpers
    //----------------------------------------
    _companyChanged($select) {
        const selection = $select.find(':selected').val();
        if (selection === 'true') {
            $(domSelector + ' .private-fields').hide();
            $(domSelector + ' .js-company-fields').show();
            $(domSelector + ' #manager-label').html(i18next.t('Effective manager (first and last name)'));
        }
        else {
            $(domSelector + ' .js-company-fields').hide();
            $(domSelector + ' .private-fields').show();
            $(domSelector + ' #manager-label').html(i18next.t('First and last name'));
        }
    }
}

export default OwnerForm;
