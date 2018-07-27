import $ from 'jquery';
import i18next from 'i18next';
import Sugar from 'sugar';
import ObjectFilter from './lib/objectfilter';
import application from './application';

class Form {
    constructor(options) {
        const defaultOptions = {
            domSelector: '',
            httpMethod: null,
            uri: null,
            defaultData: {},
            manifest: {},
            alertOnFieldError: true
        };

        this.options = Object.assign(defaultOptions, options || {});
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
        const updateFormWithData = (data, keyPostfix) => {
            if (!keyPostfix) {
                keyPostfix = '';
            }
            Sugar.Object.forEach(data, (value, key) => {
                // var keyToFilter;
                //var values;
                if (!Array.isArray(value)) {
                    if (value === null) {
                        $(this.options.domSelector + ' #' + key + keyPostfix).val('');
                    }
                    else {
                        $(this.options.domSelector + ' #' + key + keyPostfix).val(String(value));
                    }
                }
                else {
                    if (keyPostfix) {
                        throw new Error('Two levels of attributes are not supported. Attribute to fix is ' + key);
                    }
                    //values = value;
                    value.forEach((v, i) => {
                        // keyToFilter = this.options.defaultData[key];
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
        //self.validator.resetForm();
        this.$form[0].reset();
        this.$alert.hide();
        this.$form.find('.has-error').removeClass('has-error');
        this.$form.find('.js-form-row:not(.js-master-form-row)').remove();

        this.beforeSetData(arguments);

        if (!formData) {
            formData = this.options.defaultData;
        }
        const filteredData = ObjectFilter.filter(this.options.defaultData, formData);
        updateFormWithData(filteredData);

        this.afterSetData(arguments);
    }

    getData() {
        var data = {};
        var values;
        var key, value;

        this.$form.find('.js-js-form-rows').each(function () {
            var $formRows = $(this);
            var id = $formRows.attr('id');
            var $rows = $formRows.find('.js-form-row');

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

    // validate() {
    //     //this.validator.resetForm();
    //     this.$alert.hide();
    //     return this.$form.valid();
    // }

    submit(callback) {
        var self = this;
        if (this.$form.valid()) {
            const data = self.getData();

            if (self.options.httpMethod === 'POST' || !data._id || !data._id.trim()) {
                // if no _id add a new resource rather than updating it
                delete data._id;
                application.httpPost(
                    { uri: self.options.uri, data },
                    (req, res) => {
                        const response = JSON.parse(res.responseText);
                        if (response.errors && response.errors.length > 0) {
                            self.showErrorMessage(response.errors.join('<br>'));
                            return;
                        }
                        self.onSubmit(response, callback);
                    },
                    (/*req, res*/) => {
                        self.showErrorMessage(i18next.t('A technical issue has occurred (-_-\')'));
                    }
                );
            } else {
                // complete the patch url with the id of the resource
                const uri = `${self.options.uri}/${data._id}`;
                application.httpPatch(
                    { uri, data },
                    (req, res) => {
                        const response = JSON.parse(res.responseText);
                        if (response.errors && response.errors.length > 0) {
                            self.showErrorMessage(response.errors.join('<br>'));
                            return;
                        }
                        self.onSubmit(response, callback);
                    },
                    (/*req, res*/) => {
                        self.showErrorMessage(i18next.t('A technical issue has occurred (-_-\')'));
                    }
                );
            }
        }
    }

    getPropertyFilters() {
        return Sugar.Object.keys(this.options.defaultData);
    }

    unbindForm() {
        if (this.$form) {
            this.$form.off('.validate').removeData('validator');
        }
    }

    bindForm() {
        var self = this;
        var $input, id;

        self.onBind(arguments);

        self.$form = $(self.options.domSelector);
        if (self.$form.length ===0) {
            return self.$form;
        }

        self.$alert = $(self.options.domSelector + ' .form-error').hide();
        self.$alertMsg = self.$alert.find('.js-form-error-message');

        $(self.options.domSelector + ' input, ' + self.options.domSelector + ' select, ' + self.options.domSelector + ' textarea').each(function(/*index*/) {
            $input = $(this);
            id = $input.attr('id');
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
            rules : self.options.manifest,
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
                $(self.options.domSelector + ' label.error').addClass('control-label');
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
