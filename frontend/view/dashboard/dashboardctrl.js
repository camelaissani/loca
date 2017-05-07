import $ from 'jquery';
import moment from 'moment';
import Handlebars from 'handlebars';
import i18next from 'i18next';
import requester from '../../lib/requester';
import Helper from '../../lib/helper';
import ViewController from '../../lib/_viewcontroller';

class DashboardCtrl extends ViewController {

    constructor() {
        super({
            domViewId: '#view-dashboard'
        });
    }

    onInitTemplates() {
        this.notificationListTemplate = Handlebars.compile($('#notification-list-template').html());
    }

    onPageExited() {
        $('#view-dashboard .carousel').carousel('pause');
    }

    dataChanged(callback) {
        const currentMoment = moment();
        $('#view-dashboard #current-day').html(currentMoment.format('Do'));
        $('#view-dashboard .current-month').html(currentMoment.format('MMMM YYYY'));

        this._loadRentsOverview(() => {
            this._loadOccupantsOverview(() => {
                this._loadPropertiesOverview(() => {
                    this._loadNotifications(() => {
                        $('#view-dashboard .carousel').each(function(index) {
                            const $carousel = $(this);
                            if (index % 2) {
                                setTimeout(() => {
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
    }

    _loadOccupantsOverview(callback) {
        requester.ajax({
            type: 'GET',
            url: '/api/occupants/overview'
        },
        (occupantsOverview) => {
            const countAll = occupantsOverview.countAll;
            const countActive = occupantsOverview.countActive;
            const countInactive = occupantsOverview.countInactive;
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

    _loadPropertiesOverview(callback) {
        requester.ajax({
            type: 'GET',
            url: '/api/properties/overview'
        },
        (propertiesOverview) => {
            const countAll = propertiesOverview.countAll;
            const countFree = propertiesOverview.countFree;
            const countBusy = propertiesOverview.countBusy;
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

    _loadRentsOverview(callback) {
        requester.ajax({
            type: 'GET',
            url: '/api/rents/overview'
        },
        (rentsOverview) => {
            const countAll = rentsOverview.countAll;
            const countPaid = rentsOverview.countPaid;
            const countPartiallyPaid = rentsOverview.countPartiallyPaid;
            const countNotPaid = rentsOverview.countNotPaid;
            const countPaidAndPartiallyPaid = countPaid + countPartiallyPaid;
            const totalToPay = rentsOverview.totalToPay;
            const totalNotPaid = rentsOverview.totalNotPaid;
            const totalPaid = rentsOverview.totalPaid;
            $('#view-dashboard #count-all-rents').html(countAll);
            $('#view-dashboard #count-all-rents-label').html(i18next.t('Rent', {count: countAll}));
            $('#view-dashboard #count-paid-rents').html(countPaidAndPartiallyPaid + ' ' + i18next.t('Rent', {count: countPaidAndPartiallyPaid}));
            $('#view-dashboard #count-not-paid-rents').html(countNotPaid + ' ' +  i18next.t('Rent', {count: countNotPaid}));
            //$('#view-dashboard #count-partially-paid-rents').html(countPartiallyPaid);
            $('#view-dashboard #count-js-total-topay-rents').html(Helper.formatMoney(totalToPay));
            $('#view-dashboard #count-total-notpaid-rents').html(Helper.formatMoney(totalNotPaid * (-1)));
            $('#view-dashboard #count-total-paid-rents').html(Helper.formatMoney(totalPaid));
            if (callback) {
                callback();
            }
        });
    }

    _loadNotifications(callback) {
        requester.ajax({
            type: 'GET',
            url: '/api/notifications'
        },
        (notifications) => {
            let notificationsToDisplay;
            const emptyNotifications = [{
                type: 'ok',
                description: 'Rien à signaler'
            }];

            if (notifications && notifications.length > 0) {
                notificationsToDisplay = notifications.filter((notification) => {
                    return notification.expired;
                });
            }
            if (!notificationsToDisplay || notificationsToDisplay.length === 0) {
                notificationsToDisplay = emptyNotifications;
            }
            $('#view-dashboard #carousel-notifications').html(this.notificationListTemplate({
                notifications: notificationsToDisplay
            }));
            if (callback) {
                callback();
            }
        });
    }
}

export default new DashboardCtrl();
