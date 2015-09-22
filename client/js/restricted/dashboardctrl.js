LOCA.dashboardCtrl = (function ($, Handlebars) {
    var self;

    // DashboardCtrl extends Controller
    function DashboardCtrl() {
        self = this;
        // Call super constructor
        LOCA.ViewController.call(this, {
            domViewId: '#view-dashboard'
        });
    }
    DashboardCtrl.prototype = Object.create(LOCA.ViewController);
    DashboardCtrl.prototype.constructor = DashboardCtrl;

    DashboardCtrl.prototype.initTemplates = function() {
        this.templateRow = Handlebars.compile($('#view-dashboard #notification-row-template').html());
    };

    DashboardCtrl.prototype.startUp = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.startUp.call(this, callback);
    };

    DashboardCtrl.prototype.pageExit = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.pageExit.call(this, callback);
    };

    DashboardCtrl.prototype.loadData = function (callback) {
        var now = new Date();
        $('#view-dashboard #rent-month-year').html('Loyers ' + LOCA.formatMonth(now.getMonth() + 1) + ' ' + now.getFullYear());

        loadRentsOverview(function () {
            loadOccupantsOverview(function () {
                loadPropertiesOverview(function () {
                    loadNotifications(callback);
                });
            });
        });
    };

    // DashboardCtrl.prototype.loadList = function(callback) {
    //     // Call parent
    //     LOCA.ViewController.prototype.loadList.call(this, callback);
    // };

    // DashboardCtrl.prototype.getSelectedIds = function() {
    //     // Call parent
    //     LOCA.ViewController.prototype.getSelectedIds.call(this);
    // };

    // DashboardCtrl.prototype.scrollToVisible = function(selector) {
    //     // Call parent
    //     LOCA.ViewController.prototype.scrollToVisible.call(this, selector);
    // };

    // DashboardCtrl.prototype.openForm = function(id) {
    //     // Call parent
    //     LOCA.ViewController.prototype.openForm.call(this, id);
    // };

    // DashboardCtrl.prototype.closeForm = function(id) {
    //     // Call parent
    //     LOCA.ViewController.prototype.closeForm.call(this, id);
    // };

    function loadOccupantsOverview(callback) {
        LOCA.requester.ajax({
            type: 'GET',
            url: '/api/occupants/overview'
        },
        function (occupantsOverview) {
            var countAll = occupantsOverview.countAll;
            var countActive = occupantsOverview.countActive;
            var countInactive = occupantsOverview.countInactive;
            $('#view-dashboard #count-all-occupants').html(countAll);
            $('#view-dashboard #count-active-occupants').html(countActive);
            $('#view-dashboard #count-inactive-occupants').html(countInactive);
            if (callback) {
                callback();
            }
        });
    }

    function loadPropertiesOverview(callback) {
        LOCA.requester.ajax({
            type: 'GET',
            url: '/api/properties/overview'
        },
        function (propertiesOverview) {
            var countAll = propertiesOverview.countAll;
            var countFree = propertiesOverview.countFree;
            var countBusy = propertiesOverview.countBusy;
            $('#view-dashboard #count-all-properties').html(countAll);
            $('#view-dashboard #count-active-properties').html(countBusy);
            $('#view-dashboard #count-inactive-properties').html(countFree);
            if (callback) {
                callback();
            }
        });
    }

    function loadRentsOverview(callback) {
        LOCA.requester.ajax({
            type: 'GET',
            url: '/api/rents/overview'
        },
        function (rentsOverview) {
            var countAll = rentsOverview.countAll;
            var countPaid = rentsOverview.countPaid;
            var countPartiallyPaid = rentsOverview.countPartiallyPaid;
            var countNotPaid = rentsOverview.countNotPaid;
            var totalToPay = rentsOverview.totalToPay;
            var totalNotPaid = rentsOverview.totalNotPaid;
            var totalPaid = rentsOverview.totalPaid;
            $('#view-dashboard #count-all-rents').html(countAll);
            $('#view-dashboard #count-paid-rents').html(countPaid + countPartiallyPaid);
            $('#view-dashboard #count-not-paid-rents').html(countNotPaid);
            //$('#view-dashboard #count-partially-paid-rents').html(countPartiallyPaid);
            $('#view-dashboard #count-total-topay-rents').html(LOCA.formatMoney(totalToPay));
            $('#view-dashboard #count-total-notpaid-rents').html(LOCA.formatMoney(totalNotPaid*(-1)));
            $('#view-dashboard #count-total-paid-rents').html(LOCA.formatMoney(totalPaid));
            if (callback) {
                callback();
            }
        });
    }

    function loadNotifications(callback) {
        LOCA.requester.ajax({
            type: 'GET',
            url: '/api/notifications'
        },
        function (notifications) {
            var notificationsToDisplay,
                emptyNotifications = [{type:'ok', description: 'Rien à signaler'}];

            if (notifications && notifications.length > 0) {
                notificationsToDisplay = notifications.filter(function(notification) {
                    return notification.expired;
                });
            }
            if (!notificationsToDisplay || notificationsToDisplay.length === 0) {
                notificationsToDisplay = emptyNotifications;
            }
            $('#view-dashboard #notification-list').html(self.templateRow({notifications:notificationsToDisplay}));
            if (callback) {
                callback();
            }
        });
    }

    DashboardCtrl.prototype.initListeners = function() {
        // Call parent
        LOCA.ViewController.prototype.initListeners.call(this);
    };

    return new DashboardCtrl();
}) (window.$, window.Handlebars);