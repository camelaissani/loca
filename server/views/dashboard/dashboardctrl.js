LOCA.dashboardCtrl = (function ($, moment, Handlebars) {
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
        this.notificationListTemplate = Handlebars.compile($('#notification-list-template').html());
    };

    DashboardCtrl.prototype.startUp = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.startUp.call(this, callback);
    };

    DashboardCtrl.prototype.pageExit = function(callback) {
        // Call parent
        LOCA.ViewController.prototype.pageExit.call(this, function() {
            $('#view-dashboard .carousel').carousel('pause');
            if (callback) {
                callback();
            }
        });
    };

    DashboardCtrl.prototype.loadData = function (callback) {
        var currentMoment = moment();
        $('#view-dashboard #current-day').html(currentMoment.format('Do'));
        $('#view-dashboard .current-month').html(currentMoment.format('MMMM YYYY'));

        loadRentsOverview(function () {
            loadOccupantsOverview(function () {
                loadPropertiesOverview(function () {
                    loadNotifications(function() {
                        $('#view-dashboard .carousel').each(function(index) {
                            var $carousel = $(this);
                            if (index%2) {
                                setTimeout(function() {
                                    $carousel.carousel({interval: 8000});
                                }, 2500*index);
                            } else {
                                $carousel.carousel({interval: 8000});
                            }
                        });
                        if (callback) {
                            callback();
                        }
                    });
                });
            });
        });
    };

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
            $('#view-dashboard #count-all-occupants-label').html(countAll>1?'Locataires':'Locataire');
            $('#view-dashboard #count-active-occupants-label').html('En contrat');
            $('#view-dashboard #count-inactive-occupants-label').html(countInactive>1?'Resiliés':'Resilié');
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
            $('#view-dashboard #count-all-properties-label').html(countAll>1?'Biens':'Bien');
            $('#view-dashboard #count-active-properties-label').html(countBusy>1?'Loués':'Loué');
            $('#view-dashboard #count-inactive-properties-label').html(countFree>1?'Libres':'Libre');
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
            var countPaidAndPartiallyPaid = countPaid + countPartiallyPaid;
            var totalToPay = rentsOverview.totalToPay;
            var totalNotPaid = rentsOverview.totalNotPaid;
            var totalPaid = rentsOverview.totalPaid;
            $('#view-dashboard #count-all-rents').html(countAll);
            $('#view-dashboard #count-all-rents-label').html(countAll>1?'Loyers':'Loyer');
            $('#view-dashboard #count-paid-rents').html(countPaidAndPartiallyPaid + (countPaidAndPartiallyPaid>1?' loyers':' loyer'));
            $('#view-dashboard #count-not-paid-rents').html(countNotPaid +(countNotPaid>1?' loyers':' loyer'));
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
            $('#view-dashboard #carousel-notifications').html(self.notificationListTemplate({notifications:notificationsToDisplay}));
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
}) (window.$, window.moment, window.Handlebars);
