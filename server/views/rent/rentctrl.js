LOCA.rentCtrl = (function($, Handlebars, moment) {

    // RentCtrl extends Controller
    function RentCtrl() {
        this.form = new LOCA.PaymentForm();
        // Call super constructor
        LOCA.ViewController.call(this, {
            domViewId: '#view-rent',
            domListId: '#rents',
            defaultMenuId: 'rents-menu',
            listSelectionLabel: 'Selected rent',
            listSelectionMenuId: 'rents-selection-menu',
            urls: {
                overview: '/api/rents/overview',
                items: '/api/rents'
            }
        });
    }
    RentCtrl.prototype = Object.create(LOCA.ViewController.prototype);
    RentCtrl.prototype.constructor = RentCtrl;

    RentCtrl.prototype.loadList = function (callback) {
        var self = this;

        LOCA.requester.ajax({
            type: 'GET',
            url: '/api/rents/overview?month='+ LOCA.currentMonth +'&year='+ LOCA.currentYear
        },
        function(rentsOverview) {
            var countAll = rentsOverview.countAll;
            var countPaid = rentsOverview.countPaid;
            var countPartiallyPaid = rentsOverview.countPartiallyPaid;
            var countNotPaid = rentsOverview.countNotPaid;
            var totalToPay = rentsOverview.totalToPay;
            var totalNotPaid = rentsOverview.totalNotPaid;
            var totalPaid = rentsOverview.totalPaid;
            $('.all-filter-label').html('('+countAll+')');
            $('.paid-filter-label').html('('+(countPaid + countPartiallyPaid)+')');
            $('.not-paid-filter-label').html('('+countNotPaid+')');
            //$('.partially-paid-filter-label').html(countPartiallyPaid);
            $('.total-topay').html(LOCA.formatMoney(totalToPay));
            $('.total-notpaid').html(LOCA.formatMoney(totalNotPaid));
            $('.total-paid').html(LOCA.formatMoney(totalPaid));

            $('#view-rent .filterbar .user-action').removeClass('active');
            if (self.filterValue) {
                $('#view-rent .filterbar .user-action[data-value="'+self.filterValue+'"]').addClass('active');
            } else {
                $('#view-rent .filterbar .default-filter.user-action').addClass('active');
            }

            LOCA.requester.ajax({
                type: 'GET',
                url: '/api/rents?month='+ LOCA.currentMonth +'&year='+ LOCA.currentYear
            },
            function(jsonRents) {
                self.list.init({rows: jsonRents});
                if (callback) {
                    callback();
                }
            });
        });
    };

    RentCtrl.prototype.onInitTemplates = function() {
        // Handlebars templates
        var $rentsSelected;

        Handlebars.registerPartial('history-rent-row-template', $('#history-rent-row-template').html());
        this.templateHistoryRents = Handlebars.compile($('#history-rents-template').html());

        $rentsSelected = $('#view-rent-selected-list-template');
        if ($rentsSelected.length >0) {
            this.templateSelectedRow = Handlebars.compile($rentsSelected.html());
        }
    };

    RentCtrl.prototype.onInitListeners = function() {
        var self = this;

        $(document).on('click', '#view-rent #printinvoices', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/invoice?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-rent #rentcall', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/rentcall?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-rent #recovery1', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/recovery1?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-rent #recovery2', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/recovery2?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-rent #recovery3', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/recovery3?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-rent #paymentorder', function() {
            var selection = self.getSelectedIds();
            LOCA.application.openPrintPreview('/paymentorder?month=' + LOCA.currentMonth + '&year=' + LOCA.currentYear + '&occupants=' + selection);
            return false;
        });

        $(document).on('click', '#view-rent .rent-period', function() {
            var $monthButton = $(this),
                $monthPicker = $('#view-rent .month-picker');
            if ($monthPicker.is(':visible')) {
                $monthPicker.hide();
            } else {
                $monthPicker.show();
                if (!$monthButton.hasClass('mobile-view')) {
                    $monthButton.hide();
                }
            }
            return false;
        });
    };

    RentCtrl.prototype.onUserAction = function($action, actionId) {
        var self = this,
            selection = [];

        selection = self.list.getSelectedData();

        if (actionId==='list-action-pay-rent') {
            self.form.setData(selection[0]);
            self.openForm('pay-rent-form');
        }
        else if (actionId==='list-action-rents-history') {
            $('#history-rents-table').html('');
            LOCA.requester.ajax({
                type: 'GET',
                url: '/api/rents/occupant?id='+selection[0]._id
            },
            function(rentsHistory) {
                $('#history-rents-table').html(self.templateHistoryRents(rentsHistory));
                self.scrollToVisible('#renttable .active');
            });
            self.openForm('rents-history', true);
        }
        else if (actionId==='list-action-print') {
            self.openForm('print-doc-selector');
        }
        else if (actionId==='list-action-save-form') {
            self.form.submit(function(data) {
                self.closeForm(function() {
                    LOCA.requester.ajax({
                        type: 'GET',
                        url: '/api/rents/overview?month='+ LOCA.currentMonth +'&year='+ LOCA.currentYear
                    },
                    function(rentsOverview) {
                        var countAll = rentsOverview.countAll;
                        var countPaid = rentsOverview.countPaid;
                        var countPartiallyPaid = rentsOverview.countPartiallyPaid;
                        var countNotPaid = rentsOverview.countNotPaid;
                        var totalToPay = rentsOverview.totalToPay;
                        var totalNotPaid = rentsOverview.totalNotPaid;
                        var totalPaid = rentsOverview.totalPaid;
                        $('.all-filter-label').html('('+countAll+')');
                        $('.paid-filter-label').html('('+(countPaid + countPartiallyPaid)+')');
                        $('.not-paid-filter-label').html('('+countNotPaid+')');
                        //$('.partially-paid-filter-label').html(countPartiallyPaid);
                        $('.total-topay').html(LOCA.formatMoney(totalToPay));
                        $('.total-notpaid').html(LOCA.formatMoney(totalNotPaid));
                        $('.total-paid').html(LOCA.formatMoney(totalPaid));

                        self.list.update(data);
                        self.list.showAllRows(function () {
                            self.scrollToVisible();
                        });
                    });
                });
            });
        }
    };

    RentCtrl.prototype.onDataChanged = function(callback) {
        var self = this,
            $monthPicker;

        self.form.bindForm();

        $monthPicker = $('#view-rent .month-picker');
        $monthPicker.datepicker({
            language: LOCA.countryCode,
            autoclose: true,
            format: 'MM yyyy',
            startView: 1,
            minViewMode: 1
        });

        $monthPicker.datepicker('setDate', moment('01/'+LOCA.currentMonth+'/'+LOCA.currentYear, 'DD/MM/YYYY').toDate());
        $('#view-rent .rent-period').html(LOCA.formatMonthYear(LOCA.currentMonth, LOCA.currentYear).toUpperCase());
        $monthPicker.on('changeDate', function() {
            var selection = moment($(this).datepicker('getDate'));
            LOCA.currentYear = selection.get('year');
            LOCA.currentMonth = selection.get('month')+1;
            $monthPicker.hide();
            $('#view-rent .rent-period').html(LOCA.formatMonthYear(LOCA.currentMonth, LOCA.currentYear).toUpperCase()).show();
            self.loadList();
        });

        if (callback) {
            callback();
        }
    };

    return new RentCtrl();
})(window.$, window.Handlebars, window.moment);
