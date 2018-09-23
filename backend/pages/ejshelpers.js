const moment = require('moment');

module.exports = {
    formatSurface(text, hideUnit, emptyForZero) {
        if (parseFloat(text) === 0 && emptyForZero) {
            return '';
        }

        if (hideUnit) {
            return this.Intl.NumberFormat.format(text);
        }

        return `${this.Intl.NumberFormat.format(text)} m<sup>2</sup>`;
    },

    formatNumber(text) {
        return this.Intl.NumberFormat.format(text);
    },

    formatMoney(text, hideCurrency, emptyForZero) {
        if (parseFloat(text) === 0 && emptyForZero) {
            return '';
        }

        if (hideCurrency) {
            return this.Intl.NumberFormat.format(text);
        }

        return this.Intl.NumberFormatCurrency.format(text);
    },

    formatPercent(text, hidePercent, emptyForZero) {
        if (parseFloat(text) === 0 && emptyForZero) {
            return '';
        }

        if (hidePercent) {
            return this.Intl.NumberFormat.format(text);
        }

        return `${this.Intl.NumberFormat.format(text*100)} %`;
    },

    formatMonth(text) {
        return moment.months()[parseInt(text, 10)-1];
    },

    formatMonthYear(month, year) {
        return moment.months()[parseInt(month, 10)-1] + ' ' + year;
    },

    formatDate(text) {
        return moment(text, 'DD/MM/YYYY').format('L');
    },

    formatDateTime(text) {
        return moment(text, 'DD/MM/YYYY HH:MM').format('L LTS');
    }
};