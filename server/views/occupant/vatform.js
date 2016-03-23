LOCA.VatForm = (function(/*$, i18next*/) {
    // function VatForm() {
    // }

    // VatForm.prototype.showErrorMessage = function (message) {
    //     this.$errorMsg.html(message).show();
    // };

    // VatForm.prototype.resetData = function() {
    //     //this.$form.my('reset');
    // };

    // VatForm.prototype.setData = function(rent) {
    //     if (rent) {
    //         this.$form.my('data', rent);
    //     }
    // };

    // VatForm.prototype.bindActions = function() {
    // };

    // VatForm.prototype.bind = function(afterSubmitCallback) {
    //     var that = this;
    //     this.$form = $('#rent-vat-form');
    //     if (this.$form.length ===0) {
    //         return this.$form;
    //     }
    //     this.$errorMsg = this.$form.find('.errormsg');
    //     var checkPositive = function(data, value/*, $field*/) {
    //         that.$errorMsg.hide();
    //         if (!value || value.length === 0) {
    //             return '';
    //         }
    //         var val = Number(value.replace(',', '.').replace('€/m2', '').replace('m2', '').replace('%', '').replace('€', ''));
    //         if (isNaN(val)) {
    //             return 'Entrer un nombre.';
    //         }
    //         if (val < 0) {
    //             return 'Le nombre doit être supérieur à zéro.';
    //         }
    //         return '';
    //     };

    //     this.bindActions();
    //     this.$form.my({
    //         params: {
    //             delay: 0
    //         },
    //         data: {
    //             _id: null,
    //             month: null,
    //             year: null,
    //             //vatStartTime: null,
    //             vatRatio: null
    //         },
    //         ui: {
    //             '#rent\\._id': {
    //                 bind: '_id'
    //             },
    //             '#rent\\.month': {
    //                 bind: 'month'
    //                 //recalc: '#rent\\.paymentTime',
    //             },
    //             '#rent\\.year': {
    //                 bind: 'year'
    //                 //recalc: '#rent\\.paymentTime',
    //             },
    //             // '#rent\\.vatStartTime': {
    //             //     bind: function(data, value, $field) {
    //             //         return frMonthLabels[data.month-1]+' '+data.year;
    //             //     }
    //             // },
    //             '#rent\\.vatRatio': {
    //                 bind: function(data, value/*, $field*/) {
    //                     if (!value && data.vatRatio) {
    //                         value = data.vatRatio?Number(data.vatRatio * 100).toFixed(2):'';
    //                     }
    //                     else if (value){
    //                         if (Object.isNumber(value.toNumber())) {
    //                             data.vatRatio = value/100;
    //                         }
    //                         else {
    //                             data.vatRatio = null;
    //                         }
    //                     }
    //                     return value;
    //                 },
    //                 check: checkPositive
    //             }
    //         }
    //     });

    //     $('#rentvatform-send').click(function() {
    //         that.$form.my('redraw', false, false);
    //         if (that.$form.my('valid')) {
    //             var data = that.$form.my('data'),
    //                 ajaxUrl = '/rents/update';
    //             //delete data.vatStartTime;

    //             that.loca.requester.ajax({
    //                 type: 'POST',
    //                 url: ajaxUrl,
    //                 dataType: 'json',
    //                 data: { _id: data._id, month: data.month, year: data.year, vatRatio: data.vatRatio}
    //             },
    //             function(response) {
    //                 if (response.errors && response.errors.length > 0) {
    //                     that.showErrorMessage(response.errors.join('<br>'));
    //                     return;
    //                 }
    //                 afterSubmitCallback(data);
    //             },
    //             function() {
    //                 that.showErrorMessage(i18next.t('A technical issue has occured (-_-\')'));
    //             });
    //         }
    //         return false;
    //     });

    //     return this.$form;
    // };
})(window.$, window.i18next);