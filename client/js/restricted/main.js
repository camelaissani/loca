LOCA.now = new Date();
LOCA.currentMonth = LOCA.now.getMonth() + 1;
LOCA.currentYear = LOCA.now.getFullYear();

(function($, Handlebars, moment, accounting) {
    // Init locale
    moment.locale('fr');

    // Method helpers
    LOCA.formatSurface = function(text, hideUnit, emptyForZero) {
        if (parseFloat(text) === 0 && emptyForZero) {
            return '';
        }
        return accounting.formatMoney(text, 'm<sup>2</sup>', 2, '.', ',', hideUnit?'%v':'%v %s');
    };

    LOCA.formatMoney = function(text, hideCurrency, emptyForZero) {
        if (parseFloat(text) === 0 && emptyForZero) {
            return '';
        }
        return accounting.formatMoney(text, '€', 2, '.', ',', hideCurrency?'%v':'%v %s');
    };

    LOCA.formatPercent = function(text, hidePercent, emptyForZero) {
        if (parseFloat(text) === 0 && emptyForZero) {
            return '';
        }
        return accounting.formatNumber(accounting.toFixed(text*100, 2), 2, '', ',') + (hidePercent?'':' %');
    };

    LOCA.formatMonth = function(text) {
        return moment.months()[parseInt(text, 10)-1];
    };

    //Handlebars helpers
    Handlebars.registerHelper('formatSurface', function(text, options) {
        text = Handlebars.Utils.escapeExpression(text);
        text = LOCA.formatSurface(text, options.hash.hideUnit, options.hash.emptyForZero);
        return new Handlebars.SafeString(text);
    });
    Handlebars.registerHelper('formatMoney', function(text, options) {
        var html = '';
        var classes = 'price-amount';
        var key = '';
        var amount;
        var symbol = '€';

        text = Handlebars.Utils.escapeExpression(text);
        amount = accounting.formatMoney(text, '', 2, '.', ',', '%v');

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
        text = LOCA.formatPercent(text, options.hash.hidePercent, options.hash.emptyForZero);
        return new Handlebars.SafeString(text);
    });
    Handlebars.registerHelper('formatMonth', function(text/*, options*/) {
        text = Handlebars.Utils.escapeExpression(text);
        text = LOCA.formatMonth(text);
        return new Handlebars.SafeString(text);
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
            return new Handlebars.SafeString('chèque');
        }
        if (paymentType === 'cash') {
            return new Handlebars.SafeString('espèces');
        }
        if (paymentType === 'levy') {
            return new Handlebars.SafeString('prélèvement');
        }
        if (paymentType === 'transfer') {
            return new Handlebars.SafeString('virement');
        }
        return new Handlebars.SafeString('inconnu?');
    });
    Handlebars.registerHelper('paymentStatus', function() {
        var html = '';
        if (this.status === 'paid') {
            html = '<i class="fa fa-check"></i>'+' Payé';
        }
        else if (this.status === 'notpaid') {
            html = '<i class="fa fa-exclamation-triangle"></i>'+' Impayé';
        }
        else if (this.status === 'partialypaid') {
            html = '<i class="fa fa-exclamation"></i>'+' Payé (partiel)';
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
            return new Handlebars.SafeString('Local');
        }
        if (propertyType === 'parking') {
            return new Handlebars.SafeString('Parking');
        }
        if (propertyType === 'letterbox') {
            return new Handlebars.SafeString('Boîte aux lettres');
        }

        return new Handlebars.SafeString('inconnu?');
    });

    $(document).ready(function() {
        var viewId = LOCA.application.getViewFromQueryString(window.location);
        LOCA.application.updateData(viewId);
    });

})(window.$, window.Handlebars, window.moment, window.accounting);