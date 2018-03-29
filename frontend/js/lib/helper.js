import i18next from 'i18next';
import Handlebars from 'handlebars';
import moment from 'moment';
import accounting from 'accounting';

class Helper {
    // Method helpers
    static formatSurface(text, hideUnit, emptyForZero) {
        if (parseFloat(text) === 0 && emptyForZero) {
            return '';
        }
        return accounting.formatMoney(text, 'm<sup>2</sup>', 2, i18next.t('__fmt_number_thousand_separator'), i18next.t('__fmt_number_decimal_separator'), hideUnit?'%v':'%v %s');
    }

    static formatMoney(text, hideCurrency, emptyForZero) {
        if (parseFloat(text) === 0 && emptyForZero) {
            return '';
        }
        return accounting.formatMoney(text, '€', 2, i18next.t('__fmt_number_thousand_separator'), i18next.t('__fmt_number_decimal_separator'), hideCurrency?'%v':'%v %s');
    }

    static formatPercent(text, hidePercent, emptyForZero) {
        if (parseFloat(text) === 0 && emptyForZero) {
            return '';
        }
        return accounting.formatNumber(accounting.toFixed(text*100, 2), 2, i18next.t('__fmt_number_thousand_separator'), i18next.t('__fmt_number_decimal_separator')) + (hidePercent?'':' %');
    }

    static formatMonth(text) {
        return moment.months()[parseInt(text, 10)-1];
    }

    static formatMonthYear(month, year) {
        return moment.months()[parseInt(month, 10)-1] + ' ' + year;
    }

    static formatDate(text) {
        return moment(text, 'DD/MM/YYYY').format(i18next.t('__fmt_date__'));
    }

    static formatDateTime(text) {
        return moment(text, 'DD/MM/YYYY HH:MM').format(i18next.t('__fmt_datetime__'));
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
    var html = '';
    var classes = 'price-amount';
    var key = '';
    var amount;
    var symbol = '€';

    text = Handlebars.Utils.escapeExpression(text);
    amount = accounting.formatMoney(text, '', 2, i18next.t('__fmt_number_thousand_separator'), i18next.t('__fmt_number_decimal_separator'), '%v');

    if (!options) {
        html = '<span class="price-content"><span class="'+classes+'">'+amount+'</span><span class="price-symbol">'+symbol+'</span></span>';
    }
    else {
        if (parseFloat(text) === 0 && (options.hash.emptyForZero)) {
            return html;
        }

        if (options.hash.withOdometer) {
            classes += ' odometer';
            key = options.hash.withOdometer;
        }

        if (options.hash.hideCurrency) {
            html = '<span class="price-content"><span class="'+classes+'" data-key="'+key+'">'+amount+'</span></span>';
        }
        else {
            if (options.hash.symbolExtension) {
                symbol += ' ' + options.hash.symbolExtension;
            }
            html = '<span class="price-content"><span class="'+classes+'" data-key="'+key+'">'+amount+'</span><span class="price-symbol">'+symbol+'</span></span>';
        }
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
