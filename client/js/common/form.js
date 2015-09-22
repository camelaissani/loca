LOCA.Form = (function($, moment) {
    // VALIDATORS
    $.validator.addMethod('mindate', function(value, element, params) {
        var minDate = $(params[0] + ' #' + params[1]).val();
        var momentMin = moment(minDate, 'DD/MM/YYYY', true);
        var momentValue = moment(value, 'DD/MM/YYYY', true);
        params[2] = minDate;
        return this.optional(element) || (momentValue.isValid() && momentMin.isValid() && (momentValue.isSame(momentMin) || momentValue.isAfter(momentMin)));
    }, 'Veuillez indiquer une date après le {2}.');

    $.validator.addMethod('maxdate', function(value, element, params) {
        var maxDate = $(params[0] + ' #' + params[1]).val();
        var momentMax = moment(maxDate, 'DD/MM/YYYY', true);
        var momentValue = moment(value, 'DD/MM/YYYY', true);
        params[2] = maxDate;
        return this.optional(element) || (momentValue.isValid() && momentMax.isValid() && (momentValue.isSame(momentMax) || momentValue.isBefore(momentMax)));
    }, $.validator.format('Veuillez indiquer une date avant le {2}.'));

    $.validator.addMethod('maxcontractdate', function(value, element, params) {
        var contract = $(params[0] + ' #' + params[1]).val();
        var beginDate = $(params[0] + ' #' + params[2]).val();
        var endDate;
        var momentBegin, momentEnd;
        var contractDuration;
        var momentValue = moment(value, 'DD/MM/YYYY', true);

        momentBegin = moment(beginDate, 'DD/MM/YYYY', true);
        if (momentBegin.isValid()) {
            if (contract === 'custom') {
                contractDuration = moment.duration(2, 'years');
                momentEnd = moment(momentBegin).add(contractDuration).subtract('days', 1);
                return momentValue.isValid() && momentValue.isAfter(momentBegin) && (momentValue.isSame(momentEnd) || momentValue.isBefore(momentEnd));
            }
            contractDuration = moment.duration(9, 'years');
            momentEnd = moment(momentBegin).add(contractDuration).subtract('days', 1);
            endDate = momentEnd.format('DD/MM/YYYY');
            return endDate === value;
        }
        return this.optional(element);
    }, 'Date de fin de bail non valide avec le type de contrat.');

    $.validator.addMethod(
        'fdate',
        function(value, element, params) {
            var pattern = params[0];
            params[1] = moment(new Date()).format(pattern);
            return this.optional(element) || moment(value, pattern, true).isValid();
        },
        'Date non valide (ex : {1}).');

    $.validator.addMethod('phoneFR', function(phone_number, element) {
        phone_number = phone_number.replace(/\(|\)|\s+|-/g, '');
        return this.optional(element) || phone_number.length > 9 && phone_number.match(/^(?:(?:(?:00\s?|\+)33\s?)|(?:\(?0))(?:\d{2}\)?\s?\d{4}\s?\d{4}|\d{3}\)?\s?\d{3}\s?\d{3,4}|\d{4}\)?\s?(?:\d{5}|\d{3}\s?\d{3})|\d{5}\)?\s?\d{4,5})$/);
    }, 'Veuillez entrer un numéro valide.');


    function Form(options) {
        if (!options) {
            this.options = {
                alertOnFieldError: false
            };
        }
        else {
            this.options = options;
        }
    }

    // METHODS TO OVERRIDE
    Form.prototype.getDomSelector = function() {
        return '';
    };

    Form.prototype.getAddUrl = function() {
        return '';
    };

    Form.prototype.getUpdateUrl = function() {
        return '';
    };

    Form.prototype.getDefaultData = function() {
        return {};
    };

    Form.prototype.getManifest = function() {
        return {};
    };

    Form.prototype.beforeSetData = function() {};

    Form.prototype.afterSetData = function() {};

    Form.prototype.onGetData = function(data) {
        return data;
    };

    Form.prototype.onBind = function() {};

    Form.prototype.onSubmit = function(response, callback) {
        if (callback) {
            callback(response);
        }
    };

    // METHODS THAT MAKE THE JOB
    Form.prototype.showErrorMessage = function (message) {
        this.$alertMsg.html(message);
        this.$alert.show();
    };

    Form.prototype.setData = function(formData) {
        var self = this;
        var filteredData;
        var updateFormWithData = function (data, keyPostfix) {
            if (!keyPostfix) {
                keyPostfix = '';
            }
            Object.keys(data, function(key, value) {
                // var keyToFilter;
                //var values;
                if (!Array.isArray(value)) {
                    if (value === null) {
                        $(self.getDomSelector() + ' #' + key + keyPostfix).val('');
                    }
                    else {
                        $(self.getDomSelector() + ' #' + key + keyPostfix).val(String(value));
                    }
                }
                else {
                    if (keyPostfix) {
                        throw new Error('Two levels of attributes are not supported. Attribute to fix is ' + key);
                    }
                    //values = value;
                    value.forEach(function(v, i) {
                        // keyToFilter = self.getDefaultData()[key];
                        // if (keyToFilter && keyToFilter.length>0) {
                        //     value = Object.select(values[i], Object.keys(keyToFilter[0]));
                        // }
                        // else {
                        //    value = v;
                        // }
                        updateFormWithData(v, keyPostfix+'_'+i);
                    });
                }
            });
        };
        self.validator.resetForm();
        self.$alert.hide();
        self.$form.find('.has-error').removeClass('has-error');
        self.$form.find('.form-row:not(.master-form-row)').remove();

        this.beforeSetData(arguments);

        if (!formData) {
            formData = self.getDefaultData();
        }
        filteredData = LOCA.ObjectFilter.filter(this.getDefaultData(), formData);
        updateFormWithData(filteredData);

        this.afterSetData(arguments);
    };

    Form.prototype.getData = function() {
        var data = {};
        var values;
        var key, value;

        this.$form.find('.form-rows').each(function () {
            var $formRows = $(this);
            var id = $formRows.attr('id');
            var $rows = $formRows.find('.form-row');

            data[id] = [];
            $rows.each(function () {
                var $row = $(this);
                var $elements = $row.find('input, select, textarea');
                var dataRow = {};
                $elements.each(function () {
                    var $element = $(this);
                    var keyRow = $element.attr('id').replace(/_\d+$/, '');
                    dataRow[keyRow] = $element.val();
                });
                data[id].push(dataRow);
            });
        });
        values = this.$form.serializeArray();
        for (var i=0; i<values.length; ++i) {
            if (values[i].name.match(/_\d+$/)) {
                continue;
            }
            key = values[i].name;
            value = values[i].value;
            if (key in data) {
                throw new Error('key "' + key + '" already set to value >>' + data.key + '<<');
            }
            else {
                data[key] = value || '';
            }
        }
        return this.onGetData(data);
    };

    Form.prototype.validate = function() {
        this.validator.resetForm();
        this.$alert.hide();
        return this.$form.valid();
    };

    Form.prototype.submit = function(callback) {
        var self = this;
        if (self.validate()) {
            var data = self.getData();
            var url = self.getUpdateUrl();

            if (!data._id || data._id === '') {
                delete data._id;
                url = self.getAddUrl();
            }

            LOCA.requester.ajax({
                type: 'POST',
                url: url,
                dataType: 'json',
                data: data
            },
            function(response) {
                if (response.errors && response.errors.length > 0) {
                    self.showErrorMessage(response.errors.join('<br>'));
                    return;
                }
                self.onSubmit(response, callback);
            },
            function() {
                self.showErrorMessage('Une erreur technique s\'est produite.');
            });
        }
    };

    Form.prototype.getPropertyFilters = function() {
        return Object.keys(this.getDefaultData());
    };

    Form.prototype.bindForm = function() {
        var self = this;
        var $input, id;

        self.onBind(arguments);

        self.$form = $(self.getDomSelector());
        if (self.$form.length ===0) {
            return self.$form;
        }

        self.$alert = $(self.getDomSelector() + ' .form-error').hide();
        self.$alertMsg = self.$alert.find('.form-error-message');

        $(self.getDomSelector() + ' input, ' + self.getDomSelector() + ' select, ' + self.getDomSelector() + ' textarea').each(function(/*index*/) {
            $input = $(this);
            id = $(this).attr('id');
            if (!$input.attr('name')) {
                $input.attr('name', id);
            }
            // if ($input.attr('type')==='date') {
            //     $input.attr('pattern', 'dd/mm/yyyy');
            // }
        });

        self.validator = self.$form.validate( {
            debug: true,
            ignore: 'hidden',
            rules : self.getManifest(),
            highlight: function(element/*, errorClass, validClass*/) {
                var $element = $(element);
                $element.closest('.form-group').addClass('has-error');
            },
            success: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
                $(element).closest('label.error').remove();
            },
            showErrors: function(/*errorMap, errorList*/) {
                var errorCount;
                if (self.options.alertOnFieldError) {
                    errorCount = this.numberOfInvalids();
                    if (errorCount) {
                        self.$alertMsg.html('Votre formulaire n\'est pas valide. Veuillez vérifier les champs en erreur.');
                        self.$alert.show();
                    }
                }
                this.defaultShowErrors();
                $(self.getDomSelector() + ' label.error').addClass('control-label');
            },
            submitHandler: function(form) {
                if (self.$form.attr('action')) {
                    form.submit();
                }
            }
        });
        return self.$form;
    };

    return Form;

})(window.$, window.moment);
