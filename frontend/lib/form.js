import $ from 'jquery';
import moment from 'moment';
import i18next from 'i18next';
import Sugar from 'sugar';
import ObjectFilter from './objectfilter';
import requester from './requester';

// VALIDATORS
$.validator.addMethod('mindate', function(value, element, params) {
    var minDate,
        momentMin,
        momentValue;

    minDate = params[0].domSelector?$(params[0].domSelector).val():params[0].minDate;
    if (moment.isMoment(minDate)) {
        momentMin = minDate;
    } else if (moment.isDate(minDate)) {
        momentMin = moment(minDate);
    } else {
        momentMin = moment(minDate, i18next.t('__fmt_date__'), true);
    }

    momentValue = moment(value, i18next.t('__fmt_date__'), true);

    params[1] = params[0].message?i18next.t(params[0].message):i18next.t('Please set a date after the', {date: momentMin.format(i18next.t('__fmt_date__'))});
    return this.optional(element) || (momentValue.isValid() && momentMin.isValid() && (momentValue.isSame(momentMin) || momentValue.isAfter(momentMin)));
}, '{1}');

$.validator.addMethod('maxdate', function(value, element, params) {
    var maxDate,
        momentMax,
        momentValue;

    maxDate = params[0].domSelector?$(params[0].domSelector).val():params[0].maxDate;
    if (moment.isMoment(maxDate)) {
        momentMax = maxDate;
    } else if (moment.isDate(maxDate)) {
        momentMax = moment(maxDate);
    } else {
        momentMax = moment(maxDate, i18next.t('__fmt_date__'), true);
    }

    momentValue = moment(value, i18next.t('__fmt_date__'), true);

    params[1] = params[0].message?i18next.t(params[0].message):i18next.t('Please set a date before the', {date: momentMax.format(i18next.t('__fmt_date__'))});
    return this.optional(element) || (momentValue.isValid() && momentMax.isValid() && (momentValue.isSame(momentMax) || momentValue.isBefore(momentMax)));
}, '{1}');

$.validator.addMethod('maxcontractdate', function(value, element, params) {
    var contract = $(params[0] + ' #' + params[1]).val();
    var beginDate = $(params[0] + ' #' + params[2]).val();
    var endDate;
    var momentBegin, momentEnd;
    var contractDuration;
    var momentValue = moment(value, i18next.t('__fmt_date__'), true);

    momentBegin = moment(beginDate, i18next.t('__fmt_date__'), true);
    if (momentBegin.isValid()) {
        if (contract === 'custom') {
            contractDuration = moment.duration(2, 'years');
            momentEnd = moment(momentBegin).add(contractDuration).subtract(1, 'days');
            return momentValue.isValid() && momentValue.isAfter(momentBegin) && (momentValue.isSame(momentEnd) || momentValue.isBefore(momentEnd));
        }
        contractDuration = moment.duration(9, 'years');
        momentEnd = moment(momentBegin).add(contractDuration).subtract(1, 'days');
        endDate = momentEnd.format(i18next.t('__fmt_date__'));
        return endDate === value;
    }
    return this.optional(element);
}, i18next.t('The end date of contract is not compatible with contract selected'));

$.validator.addMethod('fdate', function(value, element, params) {
    var pattern = params[0];
    params[1] = moment(new Date()).format(pattern);
    return this.optional(element) || moment(value, pattern, true).isValid();
}, i18next.t('The date is not valid (Sample date:)', {date: '{1}'}));

$.validator.addMethod('phoneFR', function(phone_number, element) {
    phone_number = phone_number.replace(/\(|\)|\s+|-/g, '');
    return this.optional(element) || phone_number.length > 9 && phone_number.match(/^(?:(?:(?:00\s?|\+)33\s?)|(?:\(?0))(?:\d{2}\)?\s?\d{4}\s?\d{4}|\d{3}\)?\s?\d{3}\s?\d{3,4}|\d{4}\)?\s?(?:\d{5}|\d{3}\s?\d{3})|\d{5}\)?\s?\d{4,5})$/);
}, i18next.t('Please enter a valid phone number'));

class Form {
    constructor(options) {
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
    getDomSelector() {
        return '';
    }

    getAddUrl() {
        return null;
    }

    getUpdateUrl() {
        return null;
    }

    getDefaultData() {
        return {};
    }

    getManifest() {
        return {};
    }

    beforeSetData() {}

    afterSetData() {}

    onGetData(data) {
        return data;
    }

    onBind() {}

    onSubmit(response, callback) {
        if (callback) {
            callback(response);
        }
    }

    // METHODS THAT MAKE THE JOB
    showErrorMessage (message) {
        this.$alertMsg.html(message);
        this.$alert.show();
    }

    setData(formData) {
        var self = this;
        var filteredData;
        var updateFormWithData = function (data, keyPostfix) {
            if (!keyPostfix) {
                keyPostfix = '';
            }
            Sugar.Object.forEach(data, function(value, key) {
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
        filteredData = ObjectFilter.filter(this.getDefaultData(), formData);
        updateFormWithData(filteredData);

        this.afterSetData(arguments);
    }

    getData() {
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
    }

    validate() {
        this.validator.resetForm();
        this.$alert.hide();
        return this.$form.valid();
    }

    submit(callback) {
        var self = this;
        if (self.validate()) {
            const data = self.getData();
            let url = self.getUpdateUrl();
            let method = 'POST';

            if (!data._id || !data._id.trim()) {
                // if no _id add
                // a new resource rather than
                // updating it

                // cleaning the empty _id property
                delete data._id;
                url = self.getAddUrl();
                method = 'PUT';
            }

            requester.ajax({
                type: method,
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
                self.showErrorMessage(i18next.t('A technical issue has occured (-_-\')'));
            });
        }
    }

    getPropertyFilters() {
        return Sugar.Object.keys(this.getDefaultData());
    }

    bindForm() {
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
            id = $input.attr('id');
            if (!$input.attr('name')) {
                $input.attr('name', id);
            }
            // if ($input.attr('type')==='date') {
            //     $input.attr('pattern', 'dd/mm/yyyy');
            // }
        });

        if (self.validator) {
            self.$form.off('.validate').removeData('validator');
        }
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
                        self.$alertMsg.html(i18next.t('The form is not valid. Please check the field with error', {count: errorCount}));
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
    }
}

export default Form;
