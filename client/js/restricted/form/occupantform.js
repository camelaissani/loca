LOCA.OccupantForm = (function($, Handlebars, moment) {

    function OccupantForm() { }

    // SUBOBJECT OF FORM
    OccupantForm.prototype = new LOCA.Form({
        alertOnFieldError: true
    });

    // METHODS TO OVERRIDE
    OccupantForm.prototype.getDomSelector = function() {
        return '#occupant-form';
    };

    OccupantForm.prototype.getAddUrl = function() {
        return '/occupants/add';
    };

    OccupantForm.prototype.getUpdateUrl = function() {
        return '/occupants/update';
    };

    OccupantForm.prototype.getDefaultData = function() {
        return {
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
        };
    };

    OccupantForm.prototype.getManifest = function() {
        var self = this;
        return {
            'isCompany': 'required',
            'manager': {
                minlength: 2,
                required: true
            },
            'company': {
                minlength: 2,
                required: {
                    depends: function(/*element*/) {
                        return $(self.getDomSelector() + ' #isCompany option:selected').val()==='company';
                    }
                }
            },
            'legalForm': {
                minlength: 2,
                required: {
                    depends: function(/*element*/) {
                        return $(self.getDomSelector() + ' #isCompany option:selected').val()==='company';
                    }
                }
            },
            'siret': {
                minlength: 2,
                required: {
                    depends: function(/*element*/) {
                        return $(self.getDomSelector() + ' #isCompany option:selected').val()==='company';
                    }
                }
            },
            'capital': {
                number: true,
                min: 0,
                required: {
                    depends: function(/*element*/) {
                        return $(self.getDomSelector() + ' #isCompany option:selected').val()==='company';
                    }
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
                fdate: ['DD/MM/YYYY']
            },
            'endDate': {
                required: true,
                fdate: ['DD/MM/YYYY'],
                maxcontractdate: [self.getDomSelector(), 'contract', 'beginDate']
            },
            'terminationDate': {
                fdate: ['DD/MM/YYYY'],
                mindate: [self.getDomSelector(), 'beginDate']
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
                    depends: function(/*element*/) {
                        return $(self.getDomSelector() + ' #isVat option:selected').val()==='true';
                    }
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
                mindate: [self.getDomSelector(), 'beginDate'],
                maxdate: [self.getDomSelector(), 'endDate']
            },
            'exitDate_0': {
                required: true,
                mindate: [self.getDomSelector(), 'entryDate_0'],
                maxdate: [self.getDomSelector(), 'endDate']
            }
        };
    };

    OccupantForm.prototype.beforeSetData = function(args) {
        var self = this;
        var index, property;
        var propertyOptions = '';
        var occupant = args[0];

        this.propertyRowCount=0;
        this.contactRowCount=0;

        if (occupant) {
            if (occupant.properties) {
                occupant.properties.forEach(function(property, index) {
                    if (index !==0) {
                        self.addPropertyRow();
                    }
                });
            }
            if (occupant.contacts) {
                occupant.contacts.forEach(function(contact, index) {
                    if (index !==0) {
                        self.addContactRow();
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
        $(this.getDomSelector() + ' .available-properties').html(propertyOptions);
    };

    OccupantForm.prototype.afterSetData = function(args) {
        var occupant = args[0];

        if (occupant && occupant._id) {
            $(this.getDomSelector() + ' #occupantNameLabel').html(occupant.name);
            //$(this.getDomSelector() + ' .form-field-not-editable').attr('readonly', true).attr('disabled', true).addClass('uneditable-input');
            $(this.getDomSelector() + ' #termination-row').show();
            if (occupant.terminationDate && occupant.terminationDate!=='') {
                $('.user-action[data-id="list-action-remove-occupant"]').hide();
            }
            else {
                $('.user-action[data-id="list-action-remove-occupant"]').show();
            }
        }
        else {
            $(this.getDomSelector() + ' #occupantNameLabel').html('Locataire');
            //$(this.getDomSelector() + ' .form-field-not-editable').attr('readonly', false).attr('disabled', false).removeClass('uneditable-input');
            $(this.getDomSelector() + ' #termination-row').hide();
            $('.user-action[data-id="list-action-remove-occupant"]').hide();
        }

        companyChanged($(this.getDomSelector() + ' #isCompany'));
        contractChanged($(this.getDomSelector() + ' #contract'));
        vatChanged($(this.getDomSelector() + ' #isVat'));
        propertyChanged();
        computeRent(this);
    };

    OccupantForm.prototype.onGetData = function(data) {
        if (!data.isVat) {
            data.vatRatio = 0;
        }
        else {
            data.vatRatio = data.vatRatio / 100;
        }

        return data;
    };

    OccupantForm.prototype.addPropertyRow = function() {
        var self = this;
        // Create new property row
        var $newRow;
        var itemPropertyName;
        var itemEntryDateName;
        var itemExitDateName;

        self.propertyRowCount++;
        $newRow = $(self.getDomSelector() + ' #properties .master-form-row').clone(true).removeClass('master-form-row');
        $('.has-error', $newRow).removeClass('has-error');
        $('label.error', $newRow).remove();
        itemPropertyName = 'propertyId_'+self.propertyRowCount;
        itemEntryDateName = 'entryDate_'+self.propertyRowCount;
        itemExitDateName = 'exitDate_'+self.propertyRowCount;
        $('#propertyId_0',$newRow).attr('id', itemPropertyName).attr('name', itemPropertyName).val('');
        $('#entryDate_0',$newRow).attr('id', itemEntryDateName).attr('name', itemEntryDateName).val('');
        $('#exitDate_0',$newRow).attr('id', itemExitDateName).attr('name', itemExitDateName).val('');
        $('.form-btn-remove-row',$newRow).show();
        // Add new property row in DOM
        $(self.getDomSelector() + ' #properties').append($newRow);

        //Add jquery validation rules for new added fields
        $('#'+itemPropertyName, $newRow).rules('add', {
            required:true
        });

        $('#'+itemEntryDateName, $newRow).rules('add', {
            required: true,
            fdate: ['DD/MM/YYYY'],
            mindate: [self.getDomSelector(), 'beginDate'],
            maxdate: [self.getDomSelector(), 'endDate']
        });

        $('#'+itemExitDateName, $newRow).rules('add', {
            required: true,
            fdate: ['DD/MM/YYYY'],
            mindate: [self.getDomSelector(), itemEntryDateName],
            maxdate: [self.getDomSelector(), 'endDate']
        });
    };

    OccupantForm.prototype.addContactRow = function() {
        var self = this;
        // Create new property row
        var $newRow;
        var itemContact;
        var itemPhone;
        var itemEmail;

        self.contactRowCount++;
        $newRow = $(self.getDomSelector() + ' #contacts .master-form-row').clone(true).removeClass('master-form-row');
        $('.has-error', $newRow).removeClass('has-error');
        $('label.error', $newRow).remove();
        itemContact = 'contact_'+self.contactRowCount;
        itemPhone = 'phone_'+self.contactRowCount;
        itemEmail= 'email_'+self.contactRowCount;
        $('#contact_0',$newRow).attr('id', itemContact).attr('name', itemContact).val('');
        $('#phone_0',$newRow).attr('id', itemPhone).attr('name', itemPhone).val('');
        $('#email_0',$newRow).attr('id', itemEmail).attr('name', itemEmail).val('');
        $('.form-btn-remove-row',$newRow).show();
        // Add new property row in DOM
        $(self.getDomSelector() + ' #contacts').append($newRow);

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
    };

    OccupantForm.prototype.onBind = function() {
        var self = this;
        this.templatePropertySelector =  Handlebars.compile($(this.getDomSelector() + ' #occupant-property-selector-template').html());
        $(this.getDomSelector() + ' #isCompany').change(function() {
            companyChanged($(this));
        });

        $(this.getDomSelector() + ' #contract').change(function() {
            contractChanged($(this));
        });

        $(this.getDomSelector() + ' #beginDate').keyup(function() {
            contractBeginDateChanged($(this));
        });

        $(this.getDomSelector() + ' #isVat').change(function() {
            vatChanged($(this));
            computeRent(self);
        });

        $(this.getDomSelector() + ' #vatRatio').keyup(function() {
            computeRent(self);
        });

        $(this.getDomSelector() + ' .available-properties').change(function() {
            propertyChanged();
            computeRent(self);
        });

        $(this.getDomSelector() + ' #discount').keyup(function() {
            computeRent(self);
        });

        $(this.getDomSelector() + ' #guaranty').keyup(function() {
            computeRent(self);
        });

        // Dynamic contact rows
        $(this.getDomSelector() + ' #btn-add-contact').click(function() {
            self.addContactRow();
            return false;
        });

        // Dynamic property rows
        $(this.getDomSelector() + ' #btn-add-property').click(function() {
            self.addPropertyRow();
            propertyChanged();
            computeRent(self);
            return false;
        });

        // Remove dynamic rows
        $(this.getDomSelector() + ' .form-btn-remove-row').click(function() {
            var $row = $(this).parents('.form-row');
            var selectPropertyId = $row.find('select.available-properties').attr('id');
            if (selectPropertyId) {
                $('#occupant-form select.available-properties option[data-selectedby='+selectPropertyId+']').attr('data-selectedby', '').attr('disabled', false);
            }
            $row.remove();
            computeRent(self);
            return false;
        });

        $(this.getDomSelector() + ' .master-form-row .form-btn-remove-row').hide();
    };

    //----------------------------------------
    // Helpers
    //----------------------------------------
    function getPropertyById(form, propertyId) {
        if (form.properties) {
            for (var index=0; index<form.properties.length; ++index) {
                if (propertyId === form.properties[index]._id) {
                    return form.properties[index];
                }
            }
        }
        return null;
    }

    function companyChanged($select) {
        var selection = $select.find(':selected').val();
        if (selection === 'true') {
            $('#occupant-form .private-fields').hide();
            $('#occupant-form .company-fields').show();
            $('#occupant-form #manager-label').html('Le dirigeant de la société (Prénom et nom)');
        }
        else {
            $('#occupant-form .company-fields').hide();
            $('#occupant-form .private-fields').show();
            $('#occupant-form #manager-label').html('Prénom et nom');
        }
    }

    function contractChanged(/*$select*/) {
        // var selection = $select.find(':selected').val();
        // if (selection === 'custom') {
        //     $('#occupant-form #endDate').attr('readonly', false).attr('disabled', false).removeClass('uneditable-input');
        // }
        // else {
        //     $('#occupant-form #endDate').attr('readonly', true).attr('disabled', true).addClass('uneditable-input');
        // }
    }

    function contractBeginDateChanged($element) {
        var beginDate = $element.val();
        var contract = $('#occupant-form #contract').val();
        var contractDuration = moment.duration(9, 'years');
        var momentBegin = moment(beginDate, 'DD/MM/YYYY', true);
        var momentEnd;

        if (momentBegin.isValid() && contract !== 'custom') {
            momentEnd = moment(momentBegin).add(contractDuration).subtract('days', 1);
            $('#occupant-form #endDate').val(momentEnd.format('DD/MM/YYYY'));
        }
    }

    function vatChanged($select) {
        var selection = $select.find(':selected').val();
        if (selection === 'true') {
            $('#occupant-form .occupant-form-vatratio').show();
            $('.occupant-form-vat-row').show();
        }
        else {
            $('#occupant-form .occupant-form-vatratio').hide();
            $('.occupant-form-vat-row').hide();
        }
    }

    function propertyChanged() {
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

    function computeRent(form) {
        var data = form.getData();
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
                    property = getPropertyById(form, propertyId);
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

        $('#occupant-form-summary-guaranty').html(LOCA.formatMoney(data.guaranty, false, false));
        $('#occupant-form-summary-rentwithexpenses').html(LOCA.formatMoney(rentWithExpenses, false, false));
        $('#occupant-form-summary-discount').html(LOCA.formatMoney(data.discount, false, false));
        $('#occupant-form-summary-vat').html(LOCA.formatMoney(vat, false, false));
        $('#occupant-form-summary-total-rentwithexpenses').html(LOCA.formatMoney(rentWithDiscount, false, false));
        $('#occupant-form-summary-totla-rentwithexpensesandvat').html(LOCA.formatMoney(rentWithVat, false, false));
    }

    return OccupantForm;
})(window.$, window.Handlebars, window.moment);
