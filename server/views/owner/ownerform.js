LOCA.OwnerForm = (function($) {

    function OwnerForm() {}

    // SUBOBJECT OF FORM
    OwnerForm.prototype = new LOCA.Form({
        alertOnFieldError: true
    });

    // METHODS TO OVERRIDE
    OwnerForm.prototype.getDomSelector = function() {
        return '#owner-form';
    };

    // Only one owner
    OwnerForm.prototype.getAddUrl = function() {
        return this.getUpdateUrl();
    };

    OwnerForm.prototype.getUpdateUrl = function() {
        return '/owner/update';
    };

    OwnerForm.prototype.getDefaultData = function() {
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
    };

    OwnerForm.prototype.getManifest = function() {
        var self = this;
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
    };

    OwnerForm.prototype.onGetData = function(data) {
        if (!data.isCompany) {
            data.company = null;
            data.legalForm = null;
            data.siret = null;
            data.capital = null;
            data.vatNumber = null;
        }

        return data;
    };

    OwnerForm.prototype.afterSetData = function(/*args*/) {
        companyChanged(this.getDomSelector(), $(this.getDomSelector() + ' #isCompany'));
    };

    OwnerForm.prototype.onBind = function() {
        var self = this;
        $(this.getDomSelector() + ' #isCompany').change(function() {
            companyChanged(self.getDomSelector(), $(this));
        });
    };

    //----------------------------------------
    // Helpers
    //----------------------------------------
    function companyChanged(domSelector, $select) {
        var selection = $select.find(':selected').val();
        if (selection === 'true') {
            $(domSelector + ' .private-fields').hide();
            $(domSelector + ' .company-fields').show();
            $(domSelector + ' #manager-label').html('Le dirigeant de la société (Prénom et nom)');
        }
        else {
            $(domSelector + ' .company-fields').hide();
            $(domSelector + ' .private-fields').show();
            $(domSelector + ' #manager-label').html('Prénom et nom');
        }
    }

    return OwnerForm;
})(window.$);
