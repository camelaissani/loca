import Form from '../form';

class RealmForm extends Form {
    // function RealmForm() {
    // }

    // RealmForm.prototype.showErrorMessage = function (message) {
    //     this.$errorMsg.html(message).show();
    // };

    // RealmForm.prototype.resetData = function() {
    //     //this.$form.my('reset');
    // };

    // RealmForm.prototype.setData = function(realm) {
    //     if (realm) {
    //         this.$form.my('data', realm);
    //     }
    // };

    // RealmForm.prototype.bindActions = function() {
    //     // var $addLink = this.$form.find('a.add'),
    //     //  $removeLinks = this.$form.find('a.remove');

    //     // $addLink.click(function(event) {
    //     //  var $input = $addLink.prev('input');
    //     //  if ($input.val().isBlank()) {
    //     //      return false;
    //     //  }
    //     //  var $cloneInput = $input.clone(),
    //     //      $removeLink = $('<a class='right inline c-link remove' href='#'>X</a>');

    //     //  $input.attr('disabled', true);
    //     //  $cloneInput.val('');
    //     //  $cloneInput.insertAfter($input);
    //     //  $addLink.insertAfter($cloneInput);
    //     //  $removeLink.insertAfter($input);

    //     //  return false;
    //     // });

    //     // $('#parameter-form').on('click', 'a.remove', function(event) {
    //     // //$removeLinks.on('click', function(event) {
    //     //  var $removeLink = $(this),
    //     //      $input = $removeLink.prev('input');
    //     //  $input.remove();
    //     //  $removeLink.remove();
    //     //  return false;
    //     // });
    // };

    // RealmForm.prototype.bind = function(afterSubmitCallback) {
    //     var that = this;
    //     this.$form = $('#parameter-form');
    //     if (this.$form.length===0) {
    //         return this.$form;
    //     }
    //     this.$errorMsg = this.$form.find('.errormsg');
    //     var checkEmail = function(data, val/*, $field*/) {
    //             var re = /^$|^([a-z\d][-a-z\d_\+\.]*[a-z\d])@([a-z\d][-a-z\d\.]*[a-z\d]\.([a-z]{2,4})|((\d{1,3}\.){3}\d{1,3}))$/i;
    //             that.$errorMsg.hide();
    //             if (!val || val.length === 0) {
    //                 return '';
    //             }
    //             if (!re.test(val)) {
    //                 return 'Adresse E-mail non valide.';
    //             }
    //             return '';
    //         },
    //         checkMinLength = function(data, val/*, $field*/) {
    //             that.$errorMsg.hide();
    //             if (!val || val.length === 0) {
    //                 return '';
    //             }
    //             if (val.length < 2) {
    //                 return 'Trop court';
    //             }
    //             return '';
    //         },
    //         checkStrictPositive = function(data, value/*, $field*/) {
    //             that.$errorMsg.hide();
    //             if (!value || value.length === 0) {
    //                 return '';
    //             }
    //             var val = Number(value.replace(',', '.').replace('€/m2', '').replace('m2', '').replace('%', '').replace('€', ''));
    //             if (isNaN(val)) {
    //                 return 'Entrer un nombre.';
    //             }
    //             if (val <= 0) {
    //                 return 'Le nombre doit être supérieur à zéro.';
    //             }
    //             return '';
    //         },
    //         checkFrPhone = function(data, val/*, $field*/) {
    //             that.$errorMsg.hide();
    //             if (!val || val.length === 0) {
    //                 return '';
    //             }
    //             var re = /^0\d(\.|\-|\s)(\d{2}(\.|\-|\s)){3}\d{2}$/gi;
    //             var re2 = /^0\d{9}$/gi;
    //             if (re.test(val) || re2.test(val)) {
    //                 return '';
    //             }
    //             return 'Numéro non valide (ex : 01 45 22 35 12).';
    //         };

    //     this.bindActions();
    //     this.$form.my({
    //         params: {
    //             delay: 0
    //         },
    //         data: {
    //             name: null,
    //             administrator: null,
    //             user1: null,
    //             user2: null,
    //             user3: null,
    //             user4: null,
    //             user5: null,
    //             user6: null,
    //             user7: null,
    //             user8: null,
    //             user9: null,
    //             user10: null,
    //             renter: null,
    //             company: null,
    //             legalForm: null,
    //             capital: null,
    //             rcs: null,
    //             vatNumber: null,
    //             street1: null,
    //             street2: null,
    //             zipCode: null,
    //             city: null,
    //             contact: null,
    //             phone1: null,
    //             phone2: null,
    //             email: null
    //         },
    //         ui: {
    //             '#realm\\.name': {
    //                 bind: 'name'
    //             },
    //             '#realm\\.administrator': {
    //                 bind: 'administrator'
    //             },
    //             '#realm\\.user1': {
    //                 bind: 'user1',
    //                 check: checkEmail
    //             },
    //             '#realm\\.user2': {
    //                 bind: 'user2',
    //                 check: checkEmail
    //             },
    //             '#realm\\.user3': {
    //                 bind: 'user3',
    //                 check: checkEmail
    //             },
    //             '#realm\\.user4': {
    //                 bind: 'user4',
    //                 check: checkEmail
    //             },
    //             '#realm\\.user5': {
    //                 bind: 'user5',
    //                 check: checkEmail
    //             },
    //             '#realm\\.user6': {
    //                 bind: 'user6',
    //                 check: checkEmail
    //             },
    //             '#realm\\.user7': {
    //                 bind: 'user7',
    //                 check: checkEmail
    //             },
    //             '#realm\\.user8': {
    //                 bind: 'user8',
    //                 check: checkEmail
    //             },
    //             '#realm\\.user9': {
    //                 bind: 'user9',
    //                 check: checkEmail
    //             },
    //             '#realm\\.user10': {
    //                 bind: 'user10',
    //                 check: checkEmail
    //             },
    //             '#realm\\.renter': {
    //                 bind: 'renter',
    //                 check: checkMinLength
    //             },
    //             '#realm\\.company': {
    //                 bind: 'company'
    //             },
    //             '#realm\\.legalForm': {
    //                 bind: 'legalForm'
    //             },
    //             '#realm\\.capital': {
    //                 bind: 'capital',
    //                 check: checkStrictPositive
    //             },
    //             '#realm\\.rcs': {
    //                 bind: 'rcs'
    //             },
    //             '#realm\\.vatNumber': {
    //                 bind: 'vatNumber'
    //             },
    //             '#realm\\.street1': {
    //                 bind: 'street1',
    //                 check: checkMinLength
    //             },
    //             '#realm\\.street2': {
    //                 bind: 'street2'
    //             },
    //             '#realm\\.zipCode': {
    //                 bind: 'zipCode',
    //                 check: checkMinLength
    //             },
    //             '#realm\\.city': {
    //                 bind: 'city',
    //                 check: checkMinLength
    //             },
    //             '#realm\\.contact': {
    //                 bind: 'contact',
    //                 check: checkMinLength
    //             },
    //             '#realm\\.phone1': {
    //                 bind: 'phone1',
    //                 check: checkFrPhone
    //             },
    //             '#realm\\.phone2': {
    //                 bind: 'phone2',
    //                 check: checkFrPhone
    //             },
    //             '#realm\\.email': {
    //                 bind: 'email',
    //                 check: checkEmail
    //             },
    //             '#realm\\.bank': {
    //                 bind: 'bank',
    //                 check: checkMinLength
    //             },
    //             '#realm\\.rib': {
    //                 bind: 'rib',
    //                 check: checkMinLength
    //             }
    //         }
    //     });

    //     $('#parameterform-send').click(function() {
    //         that.$form.my('redraw', false, false);
    //         if (that.$form.my('valid')) {
    //             var data = that.$form.my('data'),
    //                 ajaxUrl ='/parameters/update';

    //             that.loca.requester.ajax({
    //                 type: 'POST',
    //                 url: ajaxUrl,
    //                 dataType: 'json',
    //                 data: data
    //             },
    //             function(response) {
    //                 if (response.errors && response.errors.length > 0) {
    //                     that.showErrorMessage(response.errors.join('<br>'));
    //                     return;
    //                 }
    //                 afterSubmitCallback(data);
    //             },
    //             function() {
    //                 that.showErrorMessage('Une erreur technique s\'est produite.');
    //             });
    //         }
    //         return false;
    //     });

    //     return this.$form;
    // };
}

export default RealmForm;
