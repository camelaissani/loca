const moment = require('moment');

const _textToNumber = text => {
    let value = parseFloat(text);
    if (isNaN(value)) {
        value = 0;
    }
    return value;
};

module.exports = {
    formatSurface(text, hideUnit, emptyForZero) {
        const value = _textToNumber(text);

        if (value === 0 && emptyForZero) {
            return '';
        }

        if (hideUnit) {
            return this.Intl.NumberFormat.format(value);
        }

        return `${this.Intl.NumberFormat.format(value)} m<sup>2</sup>`;
    },

    formatNumber(text, emptyForZero) {
        const value = _textToNumber(text);

        if (value === 0 && emptyForZero) {
            return '';
        }

        return this.Intl.NumberFormat.format(value);
    },

    formatMoney(text, hideCurrency, emptyForZero) {
        const value = _textToNumber(text);

        if (value === 0 && emptyForZero) {
            return '';
        }

        if (hideCurrency) {
            return this.Intl.NumberFormat.format(value);
        }

        return this.Intl.NumberFormatCurrency.format(value);
    },

    formatPercent(text, hidePercent, emptyForZero) {
        const value = _textToNumber(text);

        if (value === 0 && emptyForZero) {
            return '';
        }

        if (hidePercent) {
            return this.Intl.NumberFormat.format(value);
        }

        return this.Intl.NumberFormatPercent.format(value);
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

    formatDateText(text) {
        return moment(text, 'DD/MM/YYYY').format('LL');
    },

    formatDateTime(text) {
        return moment(text, 'DD/MM/YYYY HH:MM').format('L LTS');
    }
};