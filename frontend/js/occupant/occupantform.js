import $ from 'jquery';
import Handlebars from 'handlebars';
import moment from 'moment';
import i18next from 'i18next';
import Form from '../form';
import Helper from '../lib/helper';

const domSelector = '#occupant-form';

class OccupantForm extends Form {

    constructor() {
        super({
            domSelector,
            uri: '/api/occupants',
            manifest: {
                'isCompany': 'required',
                'manager': {
                    minlength: 2,
                    required: true
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
                'reference': {
                    required: true
                },
                'contract': 'required',
                'beginDate': {
                    required: true,
                    date: true
                },
                'endDate': {
                    required: true,
                    date: true,
                    maxcontractdate: [domSelector, 'contract', 'beginDate']
                },
                'terminationDate': {
                    date: true,
                    mindate: [{domSelector: domSelector + ' #beginDate'}]
                },
                'guarantyPayback': {
                    number: true,
                    min: 0
                },
                'guaranty': {
                    number: true,
                    min: 0
                },
                'isVat': 'required',
                'vatRatio': {
                    number: true,
                    min: 0,
                    max: 100,
                    required: {
                        depends: () => $(domSelector + ' #isVat option:selected').val()==='true'
                    }
                },
                'discount': {
                    number: true,
                    min: 0
                },
                'propertyId_0': {
                    required: true
                },
                'entryDate_0': {
                    required: true,
                    mindate: [{domSelector: domSelector + ' #beginDate'}],
                    maxdate: [{domSelector: domSelector + ' #endDate'}]
                },
                'exitDate_0': {
                    required: true,
                    mindate: [{domSelector: domSelector + ' #entryDate_0'}],
                    maxdate: [{domSelector: domSelector + ' #endDate'}]
                }
            },
            defaultData: {
                _id: '',
                isCompany: false,
                company: '',
                legalForm: '',
                siret: '',
                capital: '',
                manager: '',
                name: '',
                street1: '',
                street2: '',
                zipCode: '',
                city: '',
                contacts: [{contact:'', email: '', phone: ''}],
                contract: '369',
                beginDate: '',
                endDate: '',
                terminationDate: '',
                guarantyPayback: '',
                properties: [{propertyId:'', property:{}, entryDate:'', exitDate:''}],
                guaranty: '',
                reference: '',
                isVat: false,
                vatRatio: '',
                discount: ''
            }
        });
    }

    beforeSetData(args) {
        var index, property;
        var propertyOptions = '';
        var occupant = args[0];

        this.propertyRowCount=0;
        this.contactRowCount=0;

        if (occupant) {
            if (occupant.beginDate) {
                occupant.beginDate = moment(occupant.beginDate, 'DD/MM/YYYY').format('L'); //display format date
            }

            if (occupant.endDate) {
                occupant.endDate = moment(occupant.endDate, 'DD/MM/YYYY').format('L'); //display format date
            }

            if (occupant.terminationDate) {
                occupant.terminationDate = moment(occupant.terminationDate, 'DD/MM/YYYY').format('L'); //display format date
            }

            if (occupant.properties) {
                occupant.properties.forEach((property, index) => {
                    if (property.entryDate) {
                        property.entryDate = moment(property.entryDate, 'DD/MM/YYYY').format('L'); //display format date
                    }
                    if (property.exitDate) {
                        property.exitDate = moment(property.exitDate, 'DD/MM/YYYY').format('L'); //display format date
                    }
                    if (index !==0) {
                        this.addPropertyRow();
                    }
                });
            }
            if (occupant.contacts) {
                occupant.contacts.forEach((contact, index) => {
                    if (index !==0) {
                        this.addContactRow();
                    }
                });
            }
            if (!occupant.isVat) {
                occupant.vatRatio = 0;
            }
            else {
                occupant.vatRatio = occupant.vatRatio * 100;
            }
        }

        // init property combos
        this.properties = args[1];
        for (index=0; index<this.properties.length; ++index) {
            property = this.properties[index];
            property.notSelectable = (!occupant || !occupant._id);
            property.priceWithExpense = property.price + property.expense;
            if (!property.available && occupant && occupant._id === property.occupant) {
                property.available = true;
            }
        }
        propertyOptions = this.templatePropertySelector({properties: this.properties});
        $(domSelector + ' .available-properties').html(propertyOptions);
    }

    afterSetData(args) {
        var occupant = args[0];

        if (occupant && occupant._id) {
            $(domSelector + ' #occupantNameLabel').html(occupant.name);
            $(domSelector + ' #termination-row').show();
            if (occupant.terminationDate) {
                $('.js-lease-state').removeClass('hidden');
                $('.js-user-action[data-id="list-action-remove-occupant"]').addClass('disabled');
            }
            else {
                $('.js-lease-state').addClass('hidden');
                $('.js-user-action[data-id="list-action-remove-occupant"]').removeClass('disabled');
            }
        }
        else {
            $(domSelector + ' #occupantNameLabel').html(i18next.t('Tenant'));
            $(domSelector + ' #termination-row').hide();
            $('.js-user-action[data-id="list-action-remove-occupant"]').hide();
        }

        if (occupant && occupant.terminationDate) {
            $('.js-occupant-form-termination-date').html(Helper.formatDate(occupant.terminationDate));
        }
        this._companyChanged($(domSelector + ' #isCompany'));
        this._contractChanged($(domSelector + ' #contract'));
        this._vatChanged($(domSelector + ' #isVat'));
        this._propertyChanged();
        this._computeRent();
    }

    onGetData(data) {
        if (!data.isVat) {
            data.vatRatio = 0;
        }
        else {
            data.vatRatio = data.vatRatio / 100;
        }

        if (data.beginDate) {
            data.beginDate = moment(data.beginDate, 'L').format('DD/MM/YYYY'); //display format to db one
        }

        if (data.endDate) {
            data.endDate = moment(data.endDate, 'L').format('DD/MM/YYYY'); //display format to db one
        }

        if (data.terminationDate) {
            data.terminationDate = moment(data.terminationDate, 'L').format('DD/MM/YYYY'); //display format to db one
        }

        data.properties.forEach(function(property) {
            if (property.entryDate) {
                property.entryDate = moment(property.entryDate, 'L').format('DD/MM/YYYY'); //display format to db one
            }

            if (property.exitDate) {
                property.exitDate = moment(property.exitDate, 'L').format('DD/MM/YYYY'); //display format to db one
            }
        });

        return data;
    }

    addPropertyRow() {
        // Create new property row
        var $newRow;
        var itemPropertyName;
        var itemEntryDateName;
        var itemExitDateName;

        this.propertyRowCount++;
        $newRow = $(domSelector + ' #properties .js-master-form-row').clone(true).removeClass('js-master-form-row');
        $('.has-error', $newRow).removeClass('has-error');
        $('label.error', $newRow).remove();
        itemPropertyName = 'propertyId_'+this.propertyRowCount;
        itemEntryDateName = 'entryDate_'+this.propertyRowCount;
        itemExitDateName = 'exitDate_'+this.propertyRowCount;
        $('#propertyId_0',$newRow).attr('id', itemPropertyName).attr('name', itemPropertyName).val('');
        $('#entryDate_0',$newRow).attr('id', itemEntryDateName).attr('name', itemEntryDateName).val('');
        $('#exitDate_0',$newRow).attr('id', itemExitDateName).attr('name', itemExitDateName).val('');
        $('.js-btn-form-remove-row',$newRow).show();
        // Add new property row in DOM
        $(domSelector + ' #properties').append($newRow);

        //Add jquery validation rules for new added fields
        $('#'+itemPropertyName, $newRow).rules('add', {
            required:true
        });

        $('#'+itemEntryDateName, $newRow).rules('add', {
            required: true,
            date: true,
            mindate: [{domSelector: domSelector + ' #beginDate'}],
            maxdate: [{domSelector: domSelector + ' #endDate'}]
        });

        $('#'+itemExitDateName, $newRow).rules('add', {
            required: true,
            date: true,
            mindate: [{domSelector: domSelector + ' #' +itemEntryDateName}],
            maxdate: [{domSelector: domSelector + ' #endDate'}]
        });
    }

    addContactRow() {
        // Create new property row
        var $newRow;
        var itemContact;
        var itemPhone;
        var itemEmail;

        this.contactRowCount++;
        $newRow = $(domSelector + ' #contacts .js-master-form-row').clone(true).removeClass('js-master-form-row');
        $('.has-error', $newRow).removeClass('has-error');
        $('label.error', $newRow).remove();
        itemContact = 'contact_'+this.contactRowCount;
        itemPhone = 'phone_'+this.contactRowCount;
        itemEmail= 'email_'+this.contactRowCount;
        $('#contact_0',$newRow).attr('id', itemContact).attr('name', itemContact).val('');
        $('#phone_0',$newRow).attr('id', itemPhone).attr('name', itemPhone).val('');
        $('#email_0',$newRow).attr('id', itemEmail).attr('name', itemEmail).val('');
        $('.js-btn-form-remove-row',$newRow).show();
        // Add new property row in DOM
        $(domSelector + ' #contacts').append($newRow);

        //Add jquery validation rules for new added fields
        $('#'+itemContact, $newRow).rules('add', {
            minlength: 2
        });

        $('#'+itemPhone, $newRow).rules('add', {
            phoneFR: true
        });

        $('#'+itemEmail, $newRow).rules('add', {
            email: true
        });
    }

    onBind() {
        const that = this;
        this.templatePropertySelector =  Handlebars.compile($(domSelector + ' #occupant-property-selector-template').html());
        $(domSelector + ' #isCompany').change(function() {
            that._companyChanged($(this));
        });

        $(domSelector + ' #contract').change(function() {
            that._contractChanged($(this));
        });

        $(domSelector + ' #beginDate').keyup(function() {
            that._contractBeginDateChanged($(this));
        });

        $(domSelector + ' #isVat').change(function() {
            that._vatChanged($(this));
            that._computeRent();
        });

        $(domSelector + ' #vatRatio').keyup(function() {
            that._computeRent();
        });

        $(domSelector + ' .available-properties').change(function() {
            that._propertyChanged();
            that._computeRent();
        });

        $(domSelector + ' #discount').keyup(function() {
            that._computeRent();
        });

        $(domSelector + ' #guaranty').keyup(function() {
            that._computeRent();
        });

        // Dynamic contact rows
        $(domSelector + ' #btn-add-contact').click(() => {
            this.addContactRow();
            return false;
        });

        // Dynamic property rows
        $(domSelector + ' #btn-add-property').click(() => {
            this.addPropertyRow();
            this._propertyChanged();
            this._computeRent();
            return false;
        });

        // Remove dynamic rows
        $(domSelector + ' .js-btn-form-remove-row').click(function() {
            var $row = $(this).parents('.js-form-row');
            var selectPropertyId = $row.find('select.available-properties').attr('id');
            if (selectPropertyId) {
                $('#occupant-form select.available-properties option[data-selectedby='+selectPropertyId+']').attr('data-selectedby', '').attr('disabled', false);
            }
            $row.remove();
            that._computeRent();
            return false;
        });

        $(domSelector + ' .js-master-form-row .js-btn-form-remove-row').hide();
    }

    //----------------------------------------
    // Helpers
    //----------------------------------------
    _getPropertyById(propertyId) {
        if (this.properties) {
            for (var index=0; index<this.properties.length; ++index) {
                if (propertyId === this.properties[index]._id) {
                    return this.properties[index];
                }
            }
        }
        return null;
    }

    _companyChanged($select) {
        var selection = $select.find(':selected').val();
        if (selection === 'true') {
            $('#occupant-form .private-fields').hide();
            $('#occupant-form .js-company-fields').show();
            $('#occupant-form #manager-label').html(i18next.t('Effective manager (first and last name)'));
        }
        else {
            $('#occupant-form .js-company-fields').hide();
            $('#occupant-form .private-fields').show();
            $('#occupant-form #manager-label').html(i18next.t('First and last name'));
        }
    }

    _contractChanged(/*$select*/) {
        // var selection = $select.find(':selected').val();
        // if (selection === 'custom') {
        //     $('#occupant-form #endDate').attr('readonly', false).attr('disabled', false).removeClass('uneditable-input');
        // }
        // else {
        //     $('#occupant-form #endDate').attr('readonly', true).attr('disabled', true).addClass('uneditable-input');
        // }
    }

    _contractBeginDateChanged($element) {
        var beginDate = $element.val();
        var contract = $('#occupant-form #contract').val();
        var contractDuration = moment.duration(9, 'years');
        var momentBegin = moment(beginDate, 'L', true);
        var momentEnd;

        if (momentBegin.isValid() && contract !== 'custom') {
            momentEnd = moment(momentBegin).add(contractDuration).subtract(1, 'days');
            $('#occupant-form #endDate').val(momentEnd.format('L'));
        }
    }

    _vatChanged($select) {
        var selection = $select.find(':selected').val();
        if (selection === 'true') {
            $('#occupant-form .js-occupant-form-vatratio').show();
            $('.occupant-form-vat-row').show();
        }
        else {
            $('#occupant-form .js-occupant-form-vatratio').hide();
            $('.occupant-form-vat-row').hide();
        }
    }

    _propertyChanged() {
        $('#occupant-form select.available-properties').each(function() {
            var $select = $(this);
            var selectId = $select.attr('id');
            var value = $select.find('option:selected').val();
            var $others = $('#occupant-form select.available-properties').not($select);

            $others.each(function() {
                $(this).find('[data-selectedby='+selectId+']').attr('data-selectedby', '').attr('disabled', false);
                $(this).find('option[value='+value+']').attr('disabled', true).attr('data-selectedby', selectId);
            });
        });
    }

    _computeRent() {
        var data = this.getData();
        var propertyId;
        var property;
        var rentWithExpenses = 0;
        var vat = 0;
        var rentWithVat = 0;
        var rentWithDiscount = 0;

        if (data.properties) {
            for (var i=0; i<data.properties.length; ++i) {
                propertyId = data.properties[i].propertyId;
                if (propertyId) {
                    property = this._getPropertyById(propertyId);
                    rentWithExpenses += property.priceWithExpense;
                }
            }
        }

        rentWithDiscount = rentWithExpenses;
        if (rentWithExpenses>0 && data.discount) {
            rentWithDiscount -= data.discount;
        }

        if (rentWithDiscount<0) {
            rentWithDiscount = 0;
        }

        if (data.isVat && data.vatRatio) {
            vat = rentWithDiscount * data.vatRatio;
        }

        rentWithVat = rentWithDiscount + vat;

        $('.js-occupant-form-summary-guaranty').html(Helper.formatMoney(data.guaranty, false, false));
        $('.js-occupant-form-summary-rentwithexpenses').html(Helper.formatMoney(rentWithExpenses, false, false));
        $('.js-occupant-form-summary-discount').html(Helper.formatMoney(data.discount, false, false));
        $('.js-occupant-form-summary-vat').html(Helper.formatMoney(vat, false, false));
        $('.js-occupant-form-summary-total-rentwithexpenses').html(Helper.formatMoney(rentWithDiscount, false, false));
        $('.js-occupant-form-summary-total-rentwithexpensesandvat').html(Helper.formatMoney(rentWithVat, false, false));
    }
}

export default OccupantForm;
