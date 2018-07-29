const moment = require('moment');
const accounting = require('accounting');

module.exports = {
    formatSurface(text, hideUnit, emptyForZero) {
        if (parseFloat(text) === 0 && emptyForZero) {
            return '';
        }
        return accounting.formatMoney(text, 'm<sup>2</sup>', 2, this.t('__fmt_number_thousand_separator'), this.t('__fmt_number_decimal_separator'), hideUnit?'%v':'%v %s');
    },

    formatNumber(text) {
        return accounting.formatNumber(text, 2, this.t('__fmt_number_thousand_separator'), this.t('__fmt_number_decimal_separator'));
    },

    formatMoney(text, hideCurrency, emptyForZero) {
        if (parseFloat(text) === 0 && emptyForZero) {
            return '';
        }
        return accounting.formatMoney(text, this.t('__currency_symbol'), 2, this.t('__fmt_number_thousand_separator'), this.t('__fmt_number_decimal_separator'), hideCurrency?'%v':'%v %s');
    },

    formatPercent(text, hidePercent, emptyForZero) {
        if (parseFloat(text) === 0 && emptyForZero) {
            return '';
        }
        return accounting.formatNumber(accounting.toFixed(text*100, 2), 2, this.t('__fmt_number_thousand_separator'), this.t('__fmt_number_decimal_separator')) + (hidePercent?'':' %');
    },

    formatMonth(text) {
        return moment.months()[parseInt(text, 10)-1];
    },

    formatMonthYear(month, year) {
        return moment.months()[parseInt(month, 10)-1] + ' ' + year;
    },

    formatDate(text) {
        return moment(text, 'DD/MM/YYYY').format(this.t('__fmt_date__'));
    },

    formatDateTime(text) {
        return moment(text, 'DD/MM/YYYY HH:MM').format(this.t('__fmt_datetime__'));
    }
};