import $ from 'jquery';
import moment from 'moment';
import i18next from 'i18next';

export default () => {
    $.validator.addMethod('mindate', function(value, element, params) {
        let minDate;
        let momentMin;
        let momentValue;

        minDate = params[0].domSelector?$(params[0].domSelector).val():params[0].minDate;
        if (typeof minDate === 'function') {
            minDate = minDate();
        }
        if (moment.isMoment(minDate)) {
            momentMin = minDate;
        } else if (moment.isDate(minDate)) {
            momentMin = moment(minDate);
        } else {
            momentMin = moment(minDate, 'L', true);
        }

        momentValue = moment(value, 'L', true);

        params[1] = params[0].message?i18next.t(params[0].message):i18next.t('Please set a date after the', {date: momentMin.format('L')});
        return this.optional(element) || (momentValue.isValid() && momentMin.isValid() && (momentValue.isSame(momentMin) || momentValue.isAfter(momentMin)));
    }, '{1}');

    $.validator.addMethod('maxdate', function(value, element, params) {
        let maxDate;
        let momentMax;
        let momentValue;

        maxDate = params[0].domSelector?$(params[0].domSelector).val():params[0].maxDate;
        if (typeof maxDate === 'function') {
            maxDate = maxDate();
        }
        if (moment.isMoment(maxDate)) {
            momentMax = maxDate;
        } else if (moment.isDate(maxDate)) {
            momentMax = moment(maxDate);
        } else {
            momentMax = moment(maxDate, 'L', true);
        }

        momentValue = moment(value, 'L', true);

        params[1] = params[0].message?i18next.t(params[0].message):i18next.t('Please set a date before the', {date: momentMax.format('L')});
        return this.optional(element) || (momentValue.isValid() && momentMax.isValid() && (momentValue.isSame(momentMax) || momentValue.isBefore(momentMax)));
    }, '{1}');

    $.validator.addMethod('maxcontractdate', function(value, element, params) {
        var contract = $(params[0] + ' #' + params[1]).val();
        var beginDate = $(params[0] + ' #' + params[2]).val();
        var endDate;
        var momentBegin, momentEnd;
        var contractDuration;
        var momentValue = moment(value, 'L', true);

        momentBegin = moment(beginDate, 'L', true);
        if (momentBegin.isValid()) {
            if (contract === 'custom') {
                contractDuration = moment.duration(2, 'years');
                momentEnd = moment(momentBegin).add(contractDuration).subtract(1, 'days');
                return momentValue.isValid() && momentValue.isAfter(momentBegin) && (momentValue.isSame(momentEnd) || momentValue.isBefore(momentEnd));
            }
            contractDuration = moment.duration(9, 'years');
            momentEnd = moment(momentBegin).add(contractDuration).subtract(1, 'days');
            endDate = momentEnd.format('L');
            return endDate === value;
        }
        return this.optional(element);
    }, i18next.t('The end date of contract is not compatible with contract selected'));

    $.validator.methods.date = function(value, element) {
        return this.optional(element) || moment(value, 'L', true).isValid();
    };

    $.validator.messages.date = i18next.t('The date is not valid (Sample date:)', {date: moment().format('L')});

    $.validator.addMethod('phoneFR', function(phone_number, element) {
        phone_number = phone_number.replace(/\(|\)|\s+|-/g, '');
        return this.optional(element) || phone_number.length > 9 && phone_number.match(/^(?:(?:(?:00\s?|\+)33\s?)|(?:\(?0))(?:\d{2}\)?\s?\d{4}\s?\d{4}|\d{3}\)?\s?\d{3}\s?\d{3,4}|\d{4}\)?\s?(?:\d{5}|\d{3}\s?\d{3})|\d{5}\)?\s?\d{4,5})$/);
    }, i18next.t('Please enter a valid phone number'));
};
