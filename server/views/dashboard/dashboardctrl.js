LOCA.dashboardCtrl = (function($, moment, Handlebars, i18next) {
    var self;

    // DashboardCtrl extends Controller
    function DashboardCtrl() {
        self = this;
        // Call super constructor
        LOCA.ViewController.call(this, {
            domViewId: '#view-dashboard'
        });
    }
    DashboardCtrl.prototype = Object.create(LOCA.ViewController.prototype);
    DashboardCtrl.prototype.constructor = DashboardCtrl;

    DashboardCtrl.prototype.initTemplates = function() {
        this.notificationListTemplate = Handlebars.compile($('#notification-list-template').html());
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

    DashboardCtrl.prototype.loadData = function(callback) {
        var currentMoment = moment();
        $('#view-dashboard #current-day').html(currentMoment.format('Do'));
        $('#view-dashboard .current-month').html(currentMoment.format('MMMM YYYY'));

        loadRentsOverview(function() {
            loadOccupantsOverview(function() {
                loadPropertiesOverview(function() {
                    loadNotifications(function() {
                        $('#view-dashboard .carousel').each(function(index) {
                            var $carousel = $(this);
                            if (index % 2) {
                                setTimeout(function() {
                                    $carousel.carousel({
                                        interval: 8000
                                    });
                                }, 2500 * index);
                            } else {
                                $carousel.carousel({
                                    interval: 8000
                                });
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
        function(occupantsOverview) {
            var countAll = occupantsOverview.countAll;
            var countActive = occupantsOverview.countActive;
            var countInactive = occupantsOverview.countInactive;
            $('#view-dashboard #count-all-occupants').html(countAll);
            $('#view-dashboard #count-active-occupants').html(countActive);
            $('#view-dashboard #count-inactive-occupants').html(countInactive);
            $('#view-dashboard #count-all-occupants-label').html(i18next.t('Tenant', {count: countAll}));
            $('#view-dashboard #count-active-occupants-label').html(i18next.t('Lease', {count: countActive}));
            $('#view-dashboard #count-inactive-occupants-label').html(i18next.t('Terminated lease', {count: countActive}));
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
        function(propertiesOverview) {
            var countAll = propertiesOverview.countAll;
            var countFree = propertiesOverview.countFree;
            var countBusy = propertiesOverview.countBusy;
            $('#view-dashboard #count-all-properties').html(countAll);
            $('#view-dashboard #count-active-properties').html(countBusy);
            $('#view-dashboard #count-inactive-properties').html(countFree);
            $('#view-dashboard #count-all-properties-label').html(i18next.t('Property', {count: countAll}));
            $('#view-dashboard #count-active-properties-label').html(i18next.t('Leased', {count: countBusy}));
            $('#view-dashboard #count-inactive-properties-label').html(i18next.t('Available', {count: countFree}));
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
        function(rentsOverview) {
            var countAll = rentsOverview.countAll;
            var countPaid = rentsOverview.countPaid;
            var countPartiallyPaid = rentsOverview.countPartiallyPaid;
            var countNotPaid = rentsOverview.countNotPaid;
            var countPaidAndPartiallyPaid = countPaid + countPartiallyPaid;
            var totalToPay = rentsOverview.totalToPay;
            var totalNotPaid = rentsOverview.totalNotPaid;
            var totalPaid = rentsOverview.totalPaid;
            $('#view-dashboard #count-all-rents').html(countAll);
            $('#view-dashboard #count-all-rents-label').html(i18next.t('Rent', {count: countAll}));
            $('#view-dashboard #count-paid-rents').html(countPaidAndPartiallyPaid + ' ' + i18next.t('Rent', {count: countPaidAndPartiallyPaid}));
            $('#view-dashboard #count-not-paid-rents').html(countNotPaid + ' ' +  i18next.t('Rent', {count: countNotPaid}));
            //$('#view-dashboard #count-partially-paid-rents').html(countPartiallyPaid);
            $('#view-dashboard #count-total-topay-rents').html(LOCA.formatMoney(totalToPay));
            $('#view-dashboard #count-total-notpaid-rents').html(LOCA.formatMoney(totalNotPaid * (-1)));
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
        function(notifications) {
            var notificationsToDisplay,
                emptyNotifications = [{
                    type: 'ok',
                    description: 'Rien à signaler'
                }];

            if (notifications && notifications.length > 0) {
                notificationsToDisplay = notifications.filter(function(notification) {
                    return notification.expired;
                });
            }
            if (!notificationsToDisplay || notificationsToDisplay.length === 0) {
                notificationsToDisplay = emptyNotifications;
            }
            $('#view-dashboard #carousel-notifications').html(self.notificationListTemplate({
                notifications: notificationsToDisplay
            }));
            if (callback) {
                callback();
            }
        });
    }

    return new DashboardCtrl();
})(window.$, window.moment, window.Handlebars, window.i18next);
