import i18next from 'i18next';
import Handlebars from 'handlebars';
import moment from 'moment';
//import Intl from 'intl';


class Helper {
    // Method helpers
    static get _Intl() {
        return {
            NumberFormat: new Intl.NumberFormat(i18next.language, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            NumberFormatPercent: new Intl.NumberFormat(i18next.language, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            NumberFormatCurrency: new Intl.NumberFormat(i18next.language, { style: 'currency', currency: i18next.t('__currency_code') })
        };
    }

    static _textToNumber(text) {
        let value = parseFloat(text);
        if (isNaN(value)) {
            value = 0;
        }
        return value;
    }

    static formatSurface(text, hideUnit, emptyForZero) {
        const value = Helper._textToNumber(text);

        if (value === 0 && emptyForZero) {
            return '';
        }

        if (hideUnit) {
            return Helper._Intl.NumberFormat.format(value);
        }

        return `${Helper._Intl.NumberFormat.format(value)} m<sup>2</sup>`;
    }

    static formatNumber(text) {
        return Helper._Intl.NumberFormat.format(text);
    }

    static formatMoney(text, hideCurrency, emptyForZero) {
        const value = Helper._textToNumber(text);

        if (value === 0 && emptyForZero) {
            return '';
        }

        if (hideCurrency) {
            return Helper._Intl.NumberFormat.format(value);
        }

        return Helper._Intl.NumberFormatCurrency.format(value);
    }

    static formatPercent(text, hidePercent, emptyForZero) {
        const value = Helper._textToNumber(text);

        if (value === 0 && emptyForZero) {
            return '';
        }

        if (hidePercent) {
            return Helper._Intl.NumberFormat.format(value);
        }

        return Helper._Intl.NumberFormatPercent.format(value);
    }

    static formatMonth(text) {
        return moment.months()[parseInt(text, 10)-1];
    }

    static formatMonthYear(month, year) {
        return moment.months()[parseInt(month, 10)-1] + ' ' + year;
    }

    static formatDate(text) {
        let date = moment(text, 'DD/MM/YYYY');
        if (!date.isValid()) {
            date = moment(text);
        }
        return date.format('L');
    }

    static formatDateText(text) {
        let date = moment(text, 'DD/MM/YYYY');
        if (!date.isValid()) {
            date = moment(text);
        }
        return date.format('LL');
    }

    static formatDateTime(text) {
        let dateTime = moment(text);
        if (!dateTime.isValid()) {
            dateTime = moment(text, 'DD/MM/YYYY HH:MM');
        }
        return dateTime.format('L LTS');
    }
}

//Handlebars helpers
Handlebars.registerHelper('ifNeg', function(value, options) {
    if(value<0) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('i18next', function(params) {
    var attr,
        options,
        text;

    if (params.hash && params.hash.key) {
        for(attr in params.hash) {
            if (attr !== 'key') {
                if (!options) {
                    options = {};
                }
                if (attr.toLowerCase() === 'date') {
                    options[attr] = Helper.formatDate(params.hash[attr]);
                }
                else if (attr.toLowerCase() === 'amount') {
                    options[attr] = Helper.formatMoney(params.hash[attr]);
                }
                else {
                    options[attr] = params.hash[attr];
                }
            }
        }
        if (options) {
            text = i18next.t(params.hash.key, options);
        }
        else {
            text = i18next.t(params.hash.key);
        }
        return new Handlebars.SafeString(text);
    }
    return new Handlebars.SafeString('???');
});
Handlebars.registerHelper('indexPlusOne', function() {
    return new Handlebars.SafeString(Number(arguments[0].data.index)+1); //index not zero based
});
Handlebars.registerHelper('formatSurface', function(text, options) {
    text = Handlebars.Utils.escapeExpression(text);
    text = Helper.formatSurface(text, options.hash.hideUnit, options.hash.emptyForZero);
    return new Handlebars.SafeString(text);
});
Handlebars.registerHelper('formatMoney', function(text, options) {

    text = Handlebars.Utils.escapeExpression(text);

    let html = '';
    let classes = 'price-amount';
    const amount = Helper.formatNumber(text);
    const amountWithCurrencySymbol = Helper.formatMoney(text);

    if (!options) {
        html = `<span class="price-content"><span class="${classes}">${amountWithCurrencySymbol}</span></span>`;
    }
    else {
        if (parseFloat(text) === 0 && (options.hash.emptyForZero)) {
            return '';
        }

        let key = '';
        if (options.hash.withOdometer) {
            classes += ' odometer';
            key = options.hash.withOdometer;
        }

        html = `<span class="price-content"><span class="${classes}" data-key="${key}">${options.hash.hideCurrency ? amount : amountWithCurrencySymbol}</span></span>`;
    }

    return new Handlebars.SafeString(html);
});
Handlebars.registerHelper('formatPercent', function(text, options) {
    text = Handlebars.Utils.escapeExpression(text);
    text = Helper.formatPercent(text, options.hash.hidePercent, options.hash.emptyForZero);
    return new Handlebars.SafeString(text);
});
Handlebars.registerHelper('formatDate', function(text/*, options*/) {
    text = Handlebars.Utils.escapeExpression(text);
    text = Helper.formatDate(text);
    return new Handlebars.SafeString(text);
});
Handlebars.registerHelper('formatDateTime', function(text/*, options*/) {
    text = Handlebars.Utils.escapeExpression(text);
    text = Helper.formatDateTime(text);
    return new Handlebars.SafeString(text);
});
Handlebars.registerHelper('formatMonth', function(text/*, options*/) {
    text = Handlebars.Utils.escapeExpression(text);
    text = Helper.formatMonth(text);
    return new Handlebars.SafeString(text);
});
Handlebars.registerHelper('formatMonthYear', function(params) {
    if (params.hash && params.hash.month && params.hash.year) {
        return new Handlebars.SafeString(
            Helper.formatMonthYear(params.hash.month, params.hash.year)
        );
    }
    return new Handlebars.SafeString('???');
});
Handlebars.registerHelper('breaklines', function(text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
});
Handlebars.registerHelper('commentVisible', function(text) {
    if (!text || text.length ===0) {
        return new Handlebars.SafeString('display: none;');
    }
    return '';
});
Handlebars.registerHelper('paymentType', function(paymentType) {
    if (this.type) {
        paymentType = this.type;
    }
    if (paymentType === 'cheque') {
        return new Handlebars.SafeString(i18next.t('cheque'));
    }
    if (paymentType === 'cash') {
        return new Handlebars.SafeString(i18next.t('cash'));
    }
    if (paymentType === 'levy') {
        return new Handlebars.SafeString(i18next.t('levy'));
    }
    if (paymentType === 'transfer') {
        return new Handlebars.SafeString(i18next.t('transfer'));
    }
    return new Handlebars.SafeString(i18next.t('unknown'));
});
Handlebars.registerHelper('cssClassPaymentStatus', function() {
    var html = '';
    if (this.status === 'paid') {
        html = 'text-success';
    }
    else if (this.status === 'notpaid') {
        html = 'text-danger';
    }
    else if (this.status === 'partialypaid') {
        html = 'text-warning';
    }
    return new Handlebars.SafeString(html);
});
Handlebars.registerHelper('paymentStatus', function() {
    var html = '';
    if (this.status === 'paid') {
        html = i18next.t('Paid');
    }
    else if (this.status === 'notpaid') {
        html = i18next.t('Not paid');
    }
    else if (this.status === 'partialypaid') {
        html = i18next.t('Partially paid');
    }
    return new Handlebars.SafeString(html);
});
Handlebars.registerHelper('paymentBadgeStatus', function() {
    var html = '';
    if (this.status === 'paid') {
        html = '<span class="label label-success" data-toggle="tooltip" data-placement="bottom" title="'+i18next.t('Paid')+'"><i class="fa fa-check"></i> '+moment.monthsShort()[parseInt(this.month, 10)-1].toUpperCase()+'</span>';
    }
    else if (this.status === 'partialypaid') {
        html = '<span class="label label-warning" data-toggle="tooltip" data-placement="bottom" title="'+i18next.t('Partially paid')+'"><i class="fa fa-exclamation-triangle"></i> '+moment.monthsShort()[parseInt(this.month, 10)-1].toUpperCase()+'</span>';
    }
    else if (this.status === 'notpaid') {
        html = '<span class="label label-danger" data-toggle="tooltip" data-placement="bottom" title="'+i18next.t('Not paid')+'"><i class="fa fa-exclamation-triangle"></i> '+moment.monthsShort()[parseInt(this.month, 10)-1].toUpperCase()+'</span>';
    }
    return new Handlebars.SafeString(html);
});
Handlebars.registerHelper('Image', function(imageId, options) {
    var cssClass = '';
    var id;
    if (this.type) {
        id = this.type;
    }
    else {
        id = imageId;
    }
    if (imageId && imageId.hash && imageId.hash.cssClass) {
        cssClass = imageId.hash.cssClass;
    }
    else if (options && options.hash && options.hash.cssClass) {
        cssClass = options.hash.cssClass;
    }
    if (id === 'office') {
        return new Handlebars.SafeString('<i class="fa fa-home '+cssClass+'"></i>');
    }
    if (id === 'parking') {
        return new Handlebars.SafeString('<i class="fa fa-car '+cssClass+'"></i>');
    }
    if (id === 'letterbox') {
        return new Handlebars.SafeString('<i class="fa fa-envelope-o '+cssClass+'"></i>');
    }
    if (id === 'expiredDocument') {
        return new Handlebars.SafeString('<i class="fa fa-file-text '+cssClass+'"></i>');
    }
    if (id === 'ok') {
        return new Handlebars.SafeString('<i class="fa fa-thumbs-up '+cssClass+'"></i>');
    }
    if (id === 'warning') {
        return new Handlebars.SafeString('<i class="fa fa-exclamation-triangle '+cssClass+'"></i>');
    }

    return new Handlebars.SafeString('<i class="fa fa-question '+cssClass+'"></i>');
});
Handlebars.registerHelper('propertyName', function(propertyType) {
    if (this.type) {
        propertyType = this.type;
    }

    if (propertyType === 'office') {
        return new Handlebars.SafeString(i18next.t('Room'));
    }
    if (propertyType === 'parking') {
        return new Handlebars.SafeString(i18next.t('Car park'));
    }
    if (propertyType === 'letterbox') {
        return new Handlebars.SafeString(i18next.t('Letterbox'));
    }

    return new Handlebars.SafeString(i18next.t('unknown'));
});

export default Helper;
